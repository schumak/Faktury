from django.urls import path, include
from .routers import SlashOptionalRouter

from .views.person_views import PersonViewSet
from .views.invoice_view import InvoiceViewSet
from .views.identification_views import PurchasesByIdentificationView
from .views.identification_views import SalesByIdentificationView
from .views.person_views import PersonStatisticsView



router = SlashOptionalRouter()
router.register(r"persons", PersonViewSet)
router.register(r"invoices", InvoiceViewSet)

urlpatterns = [
    path("api/persons/statistics", PersonStatisticsView.as_view()),  # ⬅ MUSÍ být první

    path("api/", include(router.urls)),
    path("api/identification/<str:ico>/purchases", PurchasesByIdentificationView.as_view()),
    path("api/identification/<str:ico>/sales", SalesByIdentificationView.as_view()),
]