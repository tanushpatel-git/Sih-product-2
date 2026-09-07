#!/usr/bin/env python3
"""Dev smoke test for the RAG pipeline.

Checks that chunking, safety rules and retrieval logic behave correctly
against a live MongoDB + Ollama setup.

Usage:
    source services/ai/venv/bin/activate
    python scripts/test_rag.py --doctor-id <uuid>
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "services" / "ai"))

from app.rag.chunking import split_text  # noqa: E402
from app.rag.retrieval import retrieve  # noqa: E402
from app.chains.rag import get_relevant  # noqa: E402
from app.safety.emergency import detect_emergency  # noqa: E402
from app.safety.input import check_input  # noqa: E402
from app.safety.output import check_output  # noqa: E402
from app.safety.topic import classify_medical  # noqa: E402
from app.grounding.relevance import check_relevance  # noqa: E402
from app.grounding.validator import (  # noqa: E402
    extract_claims,
    validate_grounding,
    build_context_text,
    compute_grounding_scores,
)

FAILURES: list[str] = []


def check(name: str, ok: bool) -> None:
    print(f"{'PASS' if ok else 'FAIL'}  {name}")
    if not ok:
        FAILURES.append(name)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--doctor-id", required=True, help="doctor UUID to query against")
    args = parser.parse_args()

    # chunking
    long_para = ("Tension headaches are the most common primary headache disorder. "
                 "They present as bilateral pressing pain of mild to moderate intensity. ") * 400
    docs = split_text(long_para)
    check("chunking produces >5 chunks", len(docs) > 5)
    check("chunks keep order metadata", docs[0]["chunk_index"] == 0)

    # input safety
    check(
        "emergency keyword detected ('chest pain')",
        detect_emergency("I have chest pain"),
    )
    check(
        "normal query not flagged emergency",
        not check_input("I have a mild headache for 2 days").get("emergency"),
    )

    # scope gating (LLM classifies medical vs non-medical)
    check(
        "off-topic code question refused by classifier",
        not classify_medical("write a python hello world program"),
    )
    check(
        "medical question accepted by classifier",
        classify_medical("I have a headache for 2 days, what should I do?"),
    )

    # domain gating (only doctor's documents are in scope)
    check(
        "in-domain query returns relevant chunks",
        len(get_relevant("frequent tension headaches", doctor_id=args.doctor_id)) > 0,
    )
    check(
        "out-of-domain query returns no relevant chunks",
        len(
            get_relevant(
                "advice for heart bypass surgery recovery",
                doctor_id=args.doctor_id,
            )
        )
        == 0,
    )

    # output safety
    check(
        "output validator flags risky advice",
        bool(check_output("Take 500 mg of this drug for 2 weeks")),
    )
    check(
        "output validator accepts benign answer",
        not check_output("Consider keeping a symptom diary and seeing your doctor."),
    )

    # grounding (pure, no LLM needed for the refusal / disclaimer path)
    refusal = (
        "The available doctor-approved information does not contain medication "
        "recommendations. Please consult your doctor."
    )
    check(
        "claim extraction splits sentences",
        len(extract_claims(refusal)) == 2,
    )
    grounded = validate_grounding(refusal, "Tension headaches are common.")
    check(
        "disclaimer-only answer is grounded without LLM",
        grounded.is_grounded,
    )
    context = build_context_text(
        [{"title": "Headache Guide", "section": "Migraine", "content": "Migraine lasts 4 to 72 hours."}]
    )
    grounded2 = validate_grounding("Migraine lasts 4 to 72 hours.", context)
    check(
        "exact-context claim is grounded",
        grounded2.is_grounded,
    )
    invented = validate_grounding(
        "Take ibuprofen 400 mg twice a day. Migraine lasts 4 to 72 hours.",
        context,
    )
    check(
        "invented medication claim is blocked",
        any("ibuprofen" in c.lower() for c in invented.blocked_claims),
    )

    # relevance gate (section 12 / 32)
    symptom_chunks = [
        {"content": "Migraine is a recurrent unilateral throbbing headache."}
    ]
    check(
        "medication question refused when docs lack medication",
        not check_relevance("What medicine should I take for migraine?", symptom_chunks).ok,
    )
    med_chunks = [
        {"content": "The doctor recommends tablet 500 mg twice a day for migraine."}
    ]
    check(
        "medication question allowed when docs cover it",
        check_relevance("What medicine should I take for migraine?", med_chunks).ok,
    )

    # grounding scores (section 19)
    scores = compute_grounding_scores(
        "Migraine lasts 4 to 72 hours.",
        [{"distance": 0.2, "content": "Migraine lasts 4 to 72 hours."}],
        grounded2,
        {},
    )
    check(
        "grounding scores report metrics",
        "retrieval_relevance" in scores
        and "answer_groundedness" in scores
        and scores["safety"] == "PASS",
    )

    # retrieval
    hits = retrieve("headache management", doctor_id=args.doctor_id, top_k=3)
    check("retrieval returns <= 3 chunks", 0 <= len(hits) <= 3)
    if hits:
        check("retrieved chunk has content", bool(hits[0]["content"]))
        check(
            "retrieved chunk belongs to requested doctor",
            str(hits[0]["doctor_id"]) == args.doctor_id,
        )

    print()
    if FAILURES:
        print(f"{len(FAILURES)} check(s) failed")
        sys.exit(1)
    print("All checks passed.")


if __name__ == "__main__":
    main()