export default function PageInfoSection({
  aboutTitle = "About This Tool",
  aboutText,
  howItWorks = [],
  faqs = [],
}) {
  return (
    <section className="w-full max-w-3xl mx-auto mt-6 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-gray-100">
      <h3 className="text-xl md:text-2xl font-semibold mb-3">{aboutTitle}</h3>
      <p className="text-white/80 leading-relaxed mb-6">{aboutText}</p>

      <h4 className="text-lg font-semibold mb-3">How It Works</h4>
      <ol className="list-decimal pl-5 space-y-2 text-white/80 mb-6">
        {howItWorks.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>

      <h4 className="text-lg font-semibold mb-3">FAQs</h4>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="font-semibold text-white">{faq.question}</p>
            <p className="text-white/75 mt-1">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
