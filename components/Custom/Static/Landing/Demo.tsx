export function Demo() {
  return (
    <section className="py-24 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent mb-8">
          See Quail in Action
        </h2>
        <div className="w-full max-w-[1000px] aspect-video rounded-lg overflow-hidden shadow-xl">
          <iframe
            src="https://demo.quailbi.com/embed/demo/ai-powered-sql-queryin-oudrxkj0xyz037rr"
            className="w-full h-full"
            style={{ border: 0 }}
            allowFullScreen
            allow="fullscreen"
          />
        </div>
      </div>
    </section>
  );
}
