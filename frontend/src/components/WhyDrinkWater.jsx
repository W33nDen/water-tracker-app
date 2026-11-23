/** The 7 benefits listed in the ТЗ («WelcomePage → WhyDrinkWater»), in order. */
const REASONS = [
  'Supply of nutrients to all organs',
  'Providing oxygen to the lungs',
  'Maintaining the work of the heart',
  'Release of processed substances',
  'Ensuring the stability of the internal environment',
  'Maintaining within the normal temperature',
  'Maintaining an immune system capable of resisting disease',
];

/**
 * WhyDrinkWater — second WelcomePage block (issue #23).
 * Figma «Welcome»: light-blue card, 494px wide on tablet/desktop, full width on mobile.
 */
function WhyDrinkWater() {
  return (
    <section
      aria-labelledby="why-drink-water"
      className="w-full rounded-[10px] bg-bg-light px-4 py-6 shadow-card tablet:w-[494px] tablet:px-6 tablet:py-8"
    >
      <h2 id="why-drink-water" className="font-roboto text-lg font-medium leading-5 text-text">
        Why drink water
      </h2>
      <ul className="mt-3 flex flex-col gap-4">
        {REASONS.map((reason) => (
          <li key={reason} className="flex items-center gap-2 font-roboto text-base leading-5 text-text">
            <span aria-hidden="true" className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
            {reason}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default WhyDrinkWater;
