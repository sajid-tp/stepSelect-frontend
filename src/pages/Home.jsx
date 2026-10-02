import Navbar from '../components/Navbar';
import PromoBar from '../components/PromoBar';
import Hero from '../components/Hero';
import CategoryBanner from '../components/CategoryBanner';
import ShopByType from '../components/ShopByType';
import CuratedReleases from '../components/CuratedReleases';
import Footer from '../components/Footer';

function Home() {
  return (
    <>
      <PromoBar />
      <Navbar />
      <Hero />
      <CategoryBanner />
      <ShopByType />
      <CuratedReleases />
      <Footer />
    </>
  );
}

export default Home;
