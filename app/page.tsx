import Header from "@/components/public-web/header";
import HeroCarousel from "@/components/public-web/hero-carousel";
import JobList from "@/components/public-web/job-list";


export default function Home() {
  return (
    <div>
      <Header />
      <main className="max-w-7xl mx-auto px-4">
        <HeroCarousel />
        <JobList />
      </main>
    </div>
  );
}