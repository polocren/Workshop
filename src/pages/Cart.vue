<script setup>
import { computed, reactive, ref } from 'vue'
import { jsPDF } from 'jspdf'
import { usePlanetStore } from '../store/planets'

const planetStore = usePlanetStore()

const items = computed(() => planetStore.cartItemsDetailed)
const total = computed(() => planetStore.cartTotal)

const paymentForm = reactive({
  galacticName: '',
  paymentMethod: 'coquillages',
  deliveryNotes: '',
})

const purchaseCertificate = ref(null)

const formatCurrency = (value) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)

const removeItem = (id) => {
  planetStore.removeFromCart(id)
}

const generateCertificatePdf = (certificate) => {
  const doc = new jsPDF()
  const marginX = 18
  let cursorY = 20

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text("Certificat intergalactique d'acquisition planétaire", marginX, cursorY)

  cursorY += 12
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Référence cosmique : ${certificate.code}`, marginX, cursorY)
  cursorY += 8
  doc.text(`Délivré à : ${certificate.name}`, marginX, cursorY)
  cursorY += 8
  doc.text(`Date d'émission : ${certificate.issuedAt}`, marginX, cursorY)
  cursorY += 8
  doc.text(`Mode de paiement : ${certificate.method}`, marginX, cursorY)
  cursorY += 12

  doc.setFont('helvetica', 'bold')
  doc.text('Planètes désormais sous votre tutelle :', marginX, cursorY)
  cursorY += 10
  doc.setFont('helvetica', 'normal')

  certificate.planets.forEach((planet, index) => {
    if (cursorY > 260) {
      doc.addPage()
      cursorY = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${planet.name}`, marginX, cursorY)
    cursorY += 7

    doc.setFont('helvetica', 'normal')
    const details = [
      `Collection : ${planet.category || 'Collection Mystère'}`,
      `Valeur galactique : ${formatCurrency(planet.price)}`,
    ]
    details.forEach((line) => {
      doc.text(line, marginX + 4, cursorY)
      cursorY += 6
    })

    const summary = doc.splitTextToSize(
      planet.shortDescription || 'Description confidentielle fournie lors du prochain banquet spatial.',
      175,
    )
    doc.text(summary, marginX + 4, cursorY)
    cursorY += summary.length * 6 + 6
  })

  if (cursorY > 250) {
    doc.addPage()
    cursorY = 20
  }

  doc.setFont('helvetica', 'bold')
  doc.text('Message du Bureau Planétaire™ :', marginX, cursorY)
  cursorY += 8
  doc.setFont('helvetica', 'normal')
  const messageLines = doc.splitTextToSize(certificate.message, 175)
  doc.text(messageLines, marginX, cursorY)
  cursorY += messageLines.length * 6 + 8

  doc.setFont('helvetica', 'bold')
  doc.text(`Total des investissements lunaires : ${formatCurrency(certificate.total)}`, marginX, cursorY)

  doc.save(`certificat-planete-${certificate.code}.pdf`)
}

const submitOrder = () => {
  if (!items.value.length) {
    alert('Votre panier est vide. Adoptez au moins une planète, même minuscule !')
    return
  }

  const purchaseCode = `CERT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const purchaserName = paymentForm.galacticName || 'Acheteur anonyme du futur'
  const purchasedPlanets = items.value.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    shortDescription: item.shortDescription,
    price: item.price,
  }))

  const certificate = {
    code: purchaseCode,
    name: purchaserName,
    method: paymentForm.paymentMethod,
    message:
      paymentForm.deliveryNotes ||
      'Livraison téléportée confirmée. Merci pour votre confiance interstellaire.',
    planets: purchasedPlanets,
    total: Number(total.value.toFixed(2)),
    issuedAt: new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }),
  }

  purchaseCertificate.value = certificate

  try {
    generateCertificatePdf(certificate)
    alert('Certificat cosmique généré ! Vérifiez votre dossier de téléchargements pour le PDF sacré.')
  } catch (error) {
    console.error('Erreur lors de la génération du PDF', error)
    alert('La forge à certificats intergalactiques a trébuché. Réessayez un peu plus tard !')
  }

  planetStore.clearCart()
}
</script>

<template>
  <section class="space-y-10">
    <div class="space-y-2">
      <p class="sublabel">Étape finale</p>
      <h1 class="section-heading">Panier cosmique</h1>
      <p class="section-intro">
        Vérifiez vos acquisitions orbitales avant d’apposer votre cachet intergalactique. Chaque planète est réservée
        uniquement pour vous, jusqu’à l’émission du certificat.
      </p>
    </div>

    <div v-if="items.length === 0 && !purchaseCertificate" class="surface-panel text-center">
      <p class="text-muted">Votre panier flotte dans le vide sidéral. Ajoutez une planète pour combler ce trou noir émotionnel.</p>
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div class="space-y-4">
        <article v-for="item in items" :key="item.id" class="card flex flex-col gap-4 sm:flex-row">
          <img :src="item.image" :alt="`Illustration ${item.name}`" class="h-32 w-32 rounded-2xl object-cover" />
          <div class="flex flex-1 flex-col gap-2">
            <h2 class="text-xl font-display font-semibold text-slate-100">{{ item.name }}</h2>
            <p class="text-sm text-slate-300/80">{{ item.shortDescription }}</p>
            <div class="flex flex-wrap items-center gap-3">
              <span class="font-semibold text-sky-200">{{ formatCurrency(item.price) }}</span>
              <span class="rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-sky-100">
                Réservation unique
              </span>
            </div>
          </div>
          <div class="flex flex-col items-end justify-between gap-2">
            <span class="font-semibold text-slate-100">{{ formatCurrency(item.lineTotal) }}</span>
            <button class="btn-secondary" type="button" @click="removeItem(item.id)">Retirer</button>
          </div>
        </article>

        <div v-if="items.length" class="surface-panel flex items-center justify-between border border-slate-700/60">
          <span class="text-lg font-semibold text-slate-100">Total provisoire</span>
          <span class="text-2xl font-bold text-sky-200">{{ formatCurrency(total) }}</span>
        </div>
      </div>

      <aside class="card space-y-5">
        <h2 class="text-xl font-display font-semibold text-slate-100">Paiement certifié absurde</h2>
        <form class="space-y-4" @submit.prevent="submitOrder">
          <label class="flex flex-col gap-2">
            <span class="sublabel">Nom intergalactique officiel</span>
            <input
              v-model="paymentForm.galacticName"
              class="input-field"
              placeholder="Commandant Fantastico de la Comète Moumoute"
              type="text"
            />
          </label>

          <label class="flex flex-col gap-2">
            <span class="sublabel">Mode de paiement</span>
            <select v-model="paymentForm.paymentMethod" class="input-field">
              <option value="coquillages">Coquillages galactiques (édition collector)</option>
              <option value="cheques-lamas">Chèques-lamas interstellaires</option>
              <option value="paypal-futur">PayPal du futur (abonnement pro prophétique)</option>
            </select>
          </label>

          <label class="flex flex-col gap-2">
            <span class="sublabel">Instructions de livraison quantique</span>
            <textarea
              v-model="paymentForm.deliveryNotes"
              class="input-field"
              placeholder="Téléporter la planète dans mon salon modulable, éviter les chats lunaires."
            ></textarea>
          </label>

          <button class="btn-primary w-full" type="submit">Valider le transfert de planète</button>
        </form>

        <div v-if="purchaseCertificate" class="surface-panel border border-sky-500/30 text-sm text-slate-200">
          <p class="font-semibold text-sky-100">Certificat d’achat généré</p>
          <p class="mt-2">Acheteur : {{ purchaseCertificate.name }}</p>
          <p>Référence : {{ purchaseCertificate.code }}</p>
          <p>Date : {{ purchaseCertificate.issuedAt }}</p>
          <p>Mode de paiement : {{ purchaseCertificate.method }}</p>
          <p>Total : {{ formatCurrency(purchaseCertificate.total) }}</p>
          <div class="mt-3">
            <p class="font-semibold text-slate-100">Planètes adoptées :</p>
            <ul class="mt-1 list-disc space-y-1 pl-5 text-slate-300">
              <li v-for="planet in purchaseCertificate.planets" :key="planet.id">
                {{ planet.name }} — {{ formatCurrency(planet.price) }}
              </li>
            </ul>
          </div>
          <p class="mt-2 italic text-slate-300/80">{{ purchaseCertificate.message }}</p>
          <p class="mt-3 text-xs text-slate-500">
            Le certificat PDF a été téléchargé automatiquement. Conservez-le précieusement pour vos inspections douanières interstellaires.
          </p>
        </div>
      </aside>
    </div>
  </section>
</template>
