<img src="Readme-images/logo.png" width="300">

## 🧩 Overzicht

Hawc Eye Visitor is een mobiele applicatie (Expo React Native) voor het reserveren van bedrijfsresources zoals vergaderruimtes, auto’s en parkeerplaatsen.
De applicatie ondersteunt directe betalingen via Mollie, achteraf betalen via factuur (na administratieve goedkeuring) en automatische e-mailnotificaties via Resend.

De backend is opgebouwd met Vercel Serverless Functions. Firebase Authentication en Firestore worden gebruikt voor authenticatie en dataopslag.
Belangrijk: het opslaan van boekingen en het verzenden van e-mails gebeurt volledig server-side via een Mollie webhook, waardoor de verwerking betrouwbaar is, zelfs wanneer de gebruiker niet terugkeert naar de applicatie (production-ready, exact één keer per boeking, met idempotentie).



## 🔐 Authenticatie
Inloggen en registreren via Firebase Authentication
Ondersteuning voor:
Standaard gebruikers
Professionele gebruikers
Administrators
Automatische sessieherstelling




## 🧑‍💼 Gebruikerstypes & Rechten
Standard user
Enkel directe betaling via Mollie
Professional user
Directe betaling via Mollie
Achteraf betalen via factuur na administratieve goedkeuring
Admin
Volledige toegang
Factuurbetalingen altijd toegestaan
Beheer van factuurgoedkeuringen
De administratieve functionaliteiten dienen ter ondersteuning van de gebruikersflow en zijn niet het hoofdfocuspunt van dit project.




## 🧾 Factuurgoedkeuring
Professionele gebruikers kunnen een factuuraanvraag indienen
Status wordt opgeslagen in Firestore (invoiceApproval):
pending
approved
rejected
Administrators kunnen aanvragen goedkeuren of weigeren
Belangrijk: de backend dwingt deze goedkeuring ook effectief af.
Factuurbetalingen worden server-side geweigerd zolang invoiceApproval !== "approved" (admins uitgezonderd).




## 🗓️ Reserveringen
Selectie van datum en tijd
Conflict-controle via Firestore
Boekingen worden opgeslagen in Firestore door de backend (niet door de mobiele app)
Redux draft-systeem:
Draft blijft bestaan tot betaling of factuur
Draft wordt verwijderd na succesvolle afronding




## 💳 Betalingen
1) Directe betaling (Mollie)
Start via /api/create-payment
Betaling via WebView

De app controleert de betalingsstatus via /api/payment-status.
De backend ontvangt een bevestiging via een Mollie webhook.
Bij status paid (afgehandeld via de webhook) voert de backend het volgende uit:
-slaat de reservatie op in Firestore (exact één keer, idempotent)
-verstuurt een bevestigingsmail via Resend (exact één keer)
-De app toont uitsluitend de bevestiging aan de gebruiker en voert zelf geen opslag- of e-maillogica uit.

2) Betaling via factuur
Enkel voor professionele gebruikers
Alleen beschikbaar wanneer invoiceApproval === "approved"
App roept /api/create-invoice-booking aan

Backend:
slaat de reservatie op in Firestore
verstuurt één bevestigingsmail via Resend
Geen Mollie-betaling nodig




## 📧 E-mailnotificaties (Resend)
Bevestiging bij Mollie-betaling
Bevestiging bij factuurreservatie
Logs en verbruik zichtbaar in het Resend-dashboard
Gratis plan: 3000 e-mails / maand
Opmerking: in de huidige configuratie kan de e-mail worden verstuurd naar een testadres (TEST_EMAIL).
Voor productie dient dit te worden aangepast naar het echte e-mailadres van de gebruiker.




## 🗄️ Firestore Structuur
📂 Collectie: users
uid
 ├─ fullName
 ├─ email
 ├─ userType: "standard" | "professional" | "admin"
 ├─ companyName
 ├─ vat
 └─ invoiceApproval: "none" | "pending" | "approved" | "rejected"

📂 Collectie: bookings
resourceId
resourceName
type
location
start (ISO)
end (ISO)
total
paymentMethod: "mollie" | "invoice"
userId
userEmail
createdAt




## 🔥 Backend (Vercel Serverless Functions)
📂 Structuur
hawc-payments-backend/
 ├─ api/
 │   ├─ create-payment.js
 │   ├─ payment-status.js
 │   ├─ payment-complete.js
 │   └─ create-invoice-booking.js
 └─ vercel.json




## 📌 Endpoints
Endpoint                     Beschrijving
/api/create-payment          Start een Mollie betaling
/api/payment-status          Geeft de huidige betalingsstatus terug aan de app
/api/payment-complete        Redirect endpoint na Mollie checkout (UI flow)
/api/mollie-webhook          Mollie webhook: bij status paid wordt de booking opgeslagen en wordt één bevestigingsmail verstuurd (idempotent)
/api/create-invoice-booking  Maakt een invoice-booking aan: opslag in Firestore + één e-mail (met server-side approval check)




## 🔧 Environment Variables
Backend (Vercel)
MOLLIE_API_KEY=
RESEND_API_KEY=
TEST_EMAIL=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

API-sleutels worden beheerd via environment variables en zijn niet opgenomen in de repository.



## 🧠 Redux Draft Systeem
{
  type: "room" | "car" | "parking",
  byType: {
    room: { date, start, hours },
    car: { date, start, hours },
    parking: { date, start, hours }
  }
}

Na succesvolle boeking:
resetAll();



## 🚀 Installatie
npm install
npx expo start



## 🛠️ Backend lokaal testen
cd hawc-payments-backend
vercel dev



## 📤 Backend deployen (Production)
Automatisch via GitHub → Vercel: elke git push triggert een nieuwe deployment.
Handmatig deployen is niet nodig voor productie.



## 💳 Betalingsflow (Samenvatting)
Directe betaling
App → /create-payment → Mollie Checkout

Mollie bevestigt de betaling server-side via de webhook
→ Backend: opslag van de booking in Firestore + verzending van één bevestigingsmail

App controleert de status via /payment-status
→ App toont de bevestiging aan de gebruiker
→ Draft wordt verwijderd

Factuurbetaling
App → /create-invoice-booking
→ Backend: controleert approval server-side, opslag in Firestore + e-mail → App toont bevestiging → Draft verwijderd




## ✔️ Conclusie
HawcEyeVisitor biedt:
een complete mobiele reservatie-oplossing
veilige betalingsmogelijkheden
administratief gestuurde facturatie (afgedwongen in de backend)
automatische e-mailnotificaties (Resend)
een schaalbare serverless backend met auto-deploy
een duidelijke Firestore-datastructuur
een sterke gebruikerservaring dankzij het draft-systeem
Geschikt voor bedrijfsgebruik én als Graduaatsproef.




## 📸 Screenshots
<img src="Readme-images/login-screen.png" width="195">
<img src="Readme-images/register-screen.png" width="205">
<img src="Readme-images/home-screen.png" width="200">
<img src="Readme-images/payment-confirmation-screen.png" width="425">
<img src="Readme-images/admin-approval-screen.png" width="205">
