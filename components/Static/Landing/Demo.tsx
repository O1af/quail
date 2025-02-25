export function Demo() {
  return (
    <section className="py-24 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent mb-8">
          See Quail in Action
        </h2>
        <div className="relative w-full pt-[56.25%]">
          <iframe
            src="https://www.loom.com/embed/100f3663c84c4329b9bb90233faee05c?sid=ce3c05d1-10a9-4392-94ea-b45ba54766ab"
            className="absolute top-0 left-0 w-full h-full"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
}
