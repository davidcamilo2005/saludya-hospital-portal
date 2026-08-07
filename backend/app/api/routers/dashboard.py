"""Endpoint del dashboard administrativo (HU-12)."""

from fastapi import APIRouter, Depends

from app.api.deps import get_dashboard_service, require_admin
from app.schemas import DashboardStats
from app.services import DashboardService

router = APIRouter()


@router.get("/stats", response_model=DashboardStats, dependencies=[Depends(require_admin)])
def obtener_estadisticas(dashboard_service: DashboardService = Depends(get_dashboard_service)):
    return dashboard_service.estadisticas()
