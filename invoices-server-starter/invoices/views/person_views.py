# ViewSet a API endpointy pro práci s osobami.
# Obsahuje CRUD operace pro osoby a statistiky tržeb na osobu.

from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Q

from ..serializers import PersonSerializer
from ..models import Person, Invoice


# =========================================================
# PERSON VIEWSET
# =========================================================
# Zajišťuje standardní CRUD operace pro osoby.
# Pracuje pouze s aktivními osobami (hidden=False).
# DŮLEŽITÉ:
# - update() je klasický update → NEMĚNÍ se ID osoby
# - destroy() je soft delete → pouze nastaví hidden=True
# =========================================================
class PersonViewSet(viewsets.ModelViewSet):
    # Základní queryset – pouze aktivní osoby
    queryset = Person.objects.filter(hidden=False)
    serializer_class = PersonSerializer

    # -----------------------------------------------------
    # UPDATE OSOBY (VARIANTA 1 – SPRÁVNĚ)
    # -----------------------------------------------------
    # Aktualizuje existující osobu přímo v databázi.
    # Nevytváří nový záznam → ID osoby zůstává stejné.
    # Díky tomu zůstanou všechny faktury správně navázané.
    def update(self, request, *args, **kwargs):
        # Načtení existující osoby podle ID z URL
        instance = self.get_object()

        # Serializer pro update existující instance
        # partial=True → umožní PATCH i PUT bez nutnosti posílat všechna pole
        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)

        # Z bezpečnostních důvodů nedovolíme měnit hidden přes update
        # (hidden se mění pouze přes destroy = soft delete)
        serializer.validated_data.pop("hidden", None)

        # Uložení změn do databáze
        self.perform_update(serializer)

        # Vrácení aktualizovaných dat klientovi
        return Response(serializer.data, status=status.HTTP_200_OK)

    # -----------------------------------------------------
    # DELETE OSOBY (SOFT DELETE)
    # -----------------------------------------------------
    # Osoba se fyzicky nemaže z databáze,
    # pouze se nastaví hidden=True.
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.hidden = True
        instance.save(update_fields=["hidden"])
        return Response(status=status.HTTP_204_NO_CONTENT)


# =========================================================
# PERSON STATISTICS VIEW
# =========================================================
# API endpoint pro statistiky osob.
# Vrací seznam osob + jejich obrat (součet cen faktur).
#
# Endpoint:
#   GET /api/persons/statistics
#
# Volitelný query parametr:
#   ?include_hidden=true
#   → zahrne i smazané (hidden) osoby
# =========================================================
class PersonStatisticsView(APIView):

    def get(self, request):
        # Zjistí, zda se mají zahrnout i hidden osoby
        include_hidden = request.query_params.get("include_hidden") == "true"

        # Základní queryset osob
        persons_qs = Person.objects.all()

        # Pokud include_hidden není true, bereme jen aktivní osoby
        if not include_hidden:
            persons_qs = persons_qs.filter(hidden=False)

        results = []

        # Pro každou osobu spočítáme její obrat
        for p in persons_qs:
            # Výpočet obratu osoby:
            # - započítají se všechny faktury,
            #   kde je osoba buď seller (prodávající)
            #   NEBO buyer (kupující)
            revenue = (
                Invoice.objects
                .filter(archived=False)
                .filter(Q(seller=p) | Q(buyer=p))
                .aggregate(total=Sum("price"))["total"]
                or 0
            )

            # Výstup pro jednu osobu
            results.append(
                {
                    "personId": p.id,
                    "personName": p.name,
                    "revenue": revenue,
                }
            )

        # Vracíme pole objektů:
        # [
        #   { personId, personName, revenue },
        #   ...
        # ]
        return Response(results)