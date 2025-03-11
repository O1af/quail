import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

export function Demo() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [playVideo, setPlayVideo] = useState(false);

  return (
    <section
      id="demo"
      className="py-12 md:py-16 bg-gradient-to-b from-background to-background/90 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

      <Container>
        <motion.div
          className="flex flex-col items-center text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-3">
            Watch Quail in Action
          </span>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-3 leading-tight">
            <span className="bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent inline-block pb-1">
              See Quail Transform Your Workflow
            </span>
          </h2>
        </motion.div>

        <motion.div
          className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 max-w-[80%] md:max-w-[70%] mx-auto bg-black"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {!playVideo ? (
            <>
              <Image
                src="/demo_thumbnail.png"
                alt="Demo thumbnail"
                width={1280}
                height={720}
                className="w-full aspect-video object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Button
                  onClick={() => setPlayVideo(true)}
                  size="lg"
                  className="rounded-full w-16 h-16 bg-primary/90 hover:bg-primary hover:scale-110 transition-all duration-300"
                >
                  <Play className="h-6 w-6 text-white" />
                </Button>
              </div>
            </>
          ) : (
            <iframe
              src="https://www.loom.com/embed/100f3663c84c4329b9bb90233faee05c?sid=ce3c05d1-10a9-4392-94ea-b45ba54766ab&autoplay=1"
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setVideoLoaded(true)}
            ></iframe>
          )}

          {playVideo && !videoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
          )}
        </motion.div>
      </Container>
    </section>
  );
}
