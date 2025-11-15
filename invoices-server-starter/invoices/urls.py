from django.urls import path, include
from .routers import SlashOptionalRouter

from .views.person_views import PersonViewSet
from .views.invoice_view import InvoiceViewSet

router = SlashOptionalRouter()
router.register(r'persons', PersonViewSet)
router.register(r'invoices', InvoiceViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
