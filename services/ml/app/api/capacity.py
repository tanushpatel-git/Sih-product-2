from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..capacity import analyze_capacity

router = APIRouter()


class BedGroup(BaseModel):
    total_beds: int = Field(gt=0)
    occupied_beds: int = Field(ge=0)


class Observation(BaseModel):
    icu_occupied: int | None = Field(default=None, ge=0)
    general_occupied: int | None = Field(default=None, ge=0)
    opd_patients: int | None = Field(default=None, ge=0)
    emergency_patients: int | None = Field(default=None, ge=0)


class NearbyHospital(BaseModel):
    name: str
    distance_km: float = Field(ge=0)
    icu_total: int = Field(gt=0)
    icu_occupied: int = Field(ge=0)
    general_total: int = Field(gt=0)
    general_occupied: int = Field(ge=0)


class CapacityRequest(BaseModel):
    icu: BedGroup
    general_ward: BedGroup
    opd_patients: int = Field(ge=0)
    emergency_patients: int = Field(ge=0)
    doctors_available: int = Field(gt=0)
    history: list[Observation] = Field(default_factory=list, max_length=90)
    nearby_hospitals: list[NearbyHospital] = Field(default_factory=list, max_length=50)


@router.post("/capacity/analyze", tags=["capacity"])
async def capacity_analyze(payload: CapacityRequest):
    if payload.icu.occupied_beds > payload.icu.total_beds or payload.general_ward.occupied_beds > payload.general_ward.total_beds:
        return {"error": "Occupied beds cannot exceed total beds."}
    return analyze_capacity(payload.model_dump())
