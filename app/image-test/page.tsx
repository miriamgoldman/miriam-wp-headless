import Image from "next/image";

export default function ImageTestPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem" }}>
      <h1>Image Optimization Test</h1>

      <section style={{ marginTop: "2rem" }}>
        <h2>Next.js Image (optimized)</h2>
        <Image
          src="/oceanWave.jpg"
          alt="Ocean wave"
          width={960}
          height={640}
          style={{ width: "100%", height: "auto" }}
        />
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Raw img tag (unoptimized, for comparison)</h2>
        <img
          src="/oceanWave.jpg"
          alt="Ocean wave"
          style={{ width: "100%", height: "auto" }}
        />
      </section>
    </main>
  );
}
