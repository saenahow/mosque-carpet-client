import SectionAboutUs from "@/components/features/sections/SectionAboutUs";
import SectionContactUs from "@/components/features/sections/SectionContactUs";
import SectionHero from "@/components/features/sections/SectionHero";
import SectionVisionMision from "@/components/features/sections/SectionVisionMision";
import SectionWhyChooseUs from "@/components/features/sections/SectionWhyChooseUs";
import SectionArticles from "./SectionArticles";
import SectionFooter from "./SectionFooter";
import SectionOurProduct from "./SectionOurProducts";


const Sections = {
  section_hero: SectionHero,
  section_about_us: SectionAboutUs,
  section_vision_mision: SectionVisionMision,
  section_why_choose_us: SectionWhyChooseUs,
  section_contact_us: SectionContactUs,
  section_footer: SectionFooter,
  section_articles: SectionArticles,
  section_categories: SectionOurProduct        
}
export default function SectionContainer({ onUpdateContent, sectionName, section }) {
  const SectionContainer = Sections[sectionName];
  return <SectionContainer section={section} onUpdateContent={onUpdateContent} edit />
}