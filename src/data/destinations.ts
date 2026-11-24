export type DestinationId = 'kalsubai-summit' | 'alibaug-night-camping';

export type FactSourceType = 'verified' | 'sample';

export type AudioChannelId =
  | 'mountain-wind'
  | 'ocean-waves'
  | 'night-wind'
  | 'bonfire-crackle';

export interface AudioChannelConfig {
  id: AudioChannelId;
  label: string;
  shortLabel: string;
  description: string;
}

export interface FactField {
  id: string;
  label: string;
  value: string;
  note: string;
  sourceType: FactSourceType;
}

export interface SampleRouteStage {
  stageNumber: string;
  title: string;
  elevationNote: string;
  description: string;
}

export interface StoryMomentCard {
  id: string;
  indexLabel: string;
  title: string;
  momentType: string;
  caption: string;
  imageUrl: string;
  imageAlt: string;
}

export interface PanoramaHotspot {
  id: string;
  indexLabel: string;
  title: string;
  subtitle: string;
  categoryLabel?: string;
  description: string;
  supportingDetail?: string;
  spherical: {
    /** Horizontal angle in degrees (-180 to 180; 0 faces -Z) */
    yawDeg: number;
    /** Vertical angle in degrees (-60 to 60; positive is above horizon) */
    pitchDeg: number;
  };
}

export interface DestinationDemoData {
  id: DestinationId;
  name: string;
  shortName: string;
  categoryLabel: string;
  regionLine: string;
  tagline: string;
  intro: string;
  cardLocationLabel: string;
  cardHighlightLabel: string;
  cardHighlightValue: string;
  cardSecondaryLabel: string;
  cardSecondaryValue: string;
  heroImageUrl: string;
  heroImageAlt: string;
  cardImageUrl: string;
  cardImageAlt: string;
  sidebarImageUrl: string;
  sidebarImageAlt: string;
  sidebarCaptionTitle: string;
  sidebarCaptionText: string;
  beforeYouGoHeadline: string;
  beforeYouGoDescription: string;
  beforeYouGoNote: string;
  beforeYouGoHint: string;
  exploreCtaLabel: string;
  overviewKicker: string;
  overviewHeading: string;
  stagesHeading: string;
  stagesSubtitle: string;
  notesHeading: string;
  facts: FactField[];
  overviewParagraphs: string[];
  sampleRouteStages: SampleRouteStage[];
  samplePreparationNotes: string[];
  storySectionTitle?: string;
  storySectionSubtitle?: string;
  storyDisclosure?: string;
  storyMoments?: StoryMomentCard[];
}

export type ViewerThemeId = 'sahyadri-dawn' | 'midnight-coastal';

export interface PanoramaExperienceConfig {
  destinationId: DestinationId;
  themeId: ViewerThemeId;
  panoramaUrl: string;
  panoramaLabel: 'Illustrative 360° Sample';
  viewerHeaderTitle: string;
  viewerHeaderSubtitle?: string;
  viewerSupportingLine: string;
  dragHintText: string;
  disclaimer: string;
  viewerAriaLabel: string;
  loadingTitle: string;
  loadingSubtitle: string;
  helpTitle: string;
  initialYawDeg: number;
  initialPitchDeg: number;
  defaultFov: number;
  minFov: number;
  maxFov: number;
  hotspots: PanoramaHotspot[];
  audioChannels: AudioChannelConfig[];
}

export interface DestinationBundle {
  destination: DestinationDemoData;
  experience: PanoramaExperienceConfig;
}

export const LANDING_HERO_IMAGE = {
  url: '/src/assets/images/hero_sahyadri_sunrise_1795532417756.jpg',
  alt: 'Golden sunrise breaking above layered Sahyadri mountain ridges and morning valley cloud inversion',
};

const KALSUBAI_BUNDLE: DestinationBundle = {
  destination: {
    id: 'kalsubai-summit',
    name: 'Kalsubai Summit',
    shortName: 'Kalsubai Summit',
    categoryLabel: 'Mountain Sunrise Trek',
    regionLine: 'Maharashtra, India · Sahyadri Range (Western Ghats)',
    tagline: 'Standing above the clouds on Maharashtra’s highest mountain crest.',
    intro:
      'Rising to 1,646 meters in the Sahyadri range near Bari village, Kalsubai offers sweeping morning vistas across terraced valleys, volcanic basalt ridges, and the Bhandardara backwaters below.',
    cardLocationLabel: 'Sahyadri Range',
    cardHighlightLabel: 'Base Village',
    cardHighlightValue: 'Bari, Igatpuri–Akole',
    cardSecondaryLabel: 'Sample Grade',
    cardSecondaryValue: 'Moderate (Sample)',
    heroImageUrl: '/src/assets/images/kalsubai_summit_plateau_1795532418792.jpg',
    heroImageAlt:
      'Trekker standing on a rocky mountain summit overlooking misty Western Ghats peaks glowing at dawn',
    cardImageUrl: '/src/assets/images/kalsubai_trail_ridge_1795532419006.jpg',
    cardImageAlt:
      'High-altitude mountain ridge trail flanked by volcanic basalt rock and drifting morning mist',
    sidebarImageUrl: '/src/assets/images/kalsubai_trail_ridge_1795532419006.jpg',
    sidebarImageAlt:
      'High-altitude mountain ridge trail flanked by volcanic basalt rock and drifting morning mist',
    sidebarCaptionTitle: 'Atmosphere Preview · Editorial Photography',
    sidebarCaptionText:
      'Morning mist frequently pools inside the valleys below the ridge, creating clear cloud layers when viewed from above 1,400 meters.',
    beforeYouGoHeadline: 'Don’t just see the destination. Experience it.',
    beforeYouGoDescription:
      'Step into an interactive 360° sunrise summit environment to drag around the horizon, inspect three landscape viewpoints, and optionally listen to mountain wind—then return directly to your exact reading position below.',
    beforeYouGoNote:
      'Transparency note: This viewer renders an illustrative 2:1 equirectangular Sahyadri-inspired sunrise sample environment rather than field-captured Kalsubai survey footage.',
    beforeYouGoHint: 'Drag to look · 3 viewpoints · Audio muted by default',
    exploreCtaLabel: 'Explore this summit in 360°',
    overviewKicker: 'Destination Overview',
    overviewHeading: 'High above the Sahyadri skyline',
    stagesHeading: 'Sample Ascent Progression',
    stagesSubtitle: 'Illustrative prototype stages',
    notesHeading: 'Sample Preparation Notes',
    facts: [
      {
        id: 'elevation',
        label: 'Summit Elevation',
        value: '1,646 m (5,400 ft)',
        note: 'Verified · Highest peak in Maharashtra',
        sourceType: 'verified',
      },
      {
        id: 'region',
        label: 'Region & Base',
        value: 'Bari Village, Akole',
        note: 'Verified · Sahyadri / Western Ghats',
        sourceType: 'verified',
      },
      {
        id: 'difficulty',
        label: 'Trail Grade',
        value: 'Moderate',
        note: 'Sample · Steep sections with iron ladders',
        sourceType: 'sample',
      },
      {
        id: 'duration',
        label: 'Typical Ascent Window',
        value: '6–8 hrs round trip',
        note: 'Sample · Illustrative prototype pacing',
        sourceType: 'sample',
      },
    ],
    overviewParagraphs: [
      'Known locally as the Everest of Maharashtra, Kalsubai Peak rewards early-morning ascents with an unbroken horizon across the Western Ghats. The trail climbs steadily from Bari village through farmland clearings, wind-swept grasslands, and fixed iron ladders anchored into basalt rock faces.',
      'Because static photographs rarely convey the openness and vertical scale of a summit ridge, this MyTravWay prototype lets you step into an optional 360° sunrise summit preview before deciding whether the terrain and atmosphere match what you are looking for.',
    ],
    sampleRouteStages: [
      {
        stageNumber: '01',
        title: 'Bari Base Clearing to First Plateau',
        elevationNote: 'Sample stage · Gentle incline',
        description:
          'A gradual warm-up stretch winding out of agricultural foothills onto the lower ridge shoulder as pre-dawn air cools.',
      },
      {
        stageNumber: '02',
        title: 'Basalt Ridge & Iron Ladder Sections',
        elevationNote: 'Sample stage · Exposed rock steps',
        description:
          'Three steep rock patches assisted by fixed iron ladders where footing slows and valley views open behind the trail.',
      },
      {
        stageNumber: '03',
        title: 'Upper Wind Saddle',
        elevationNote: 'Sample stage · Open ridge exposure',
        description:
          'A breezy traverse above the tree line where low cloud banks drift across adjacent Sahyadri fort silhouettes.',
      },
      {
        stageNumber: '04',
        title: 'Kalsubai Summit Crest',
        elevationNote: 'Verified peak · 1,646 m',
        description:
          'The compact rocky crown housing the Kalsubai Devi shrine and a 360-degree vantage over surrounding ranges and valleys.',
      },
    ],
    samplePreparationNotes: [
      'Sample note: Wear high-grip trekking footwear suited for uneven volcanic basalt steps.',
      'Sample note: Carry a lightweight windproof layer—summit gusts drop temperatures sharply before sunrise.',
      'Sample note: Pack a headlamp and at least 2 liters of water for pre-dawn starts.',
      'Prototype disclosure: Sample route pacing and packing notes are illustrative only and do not represent a live MyTravWay itinerary or booking schedule.',
    ],
  },
  experience: {
    destinationId: 'kalsubai-summit',
    themeId: 'sahyadri-dawn',
    panoramaUrl: '/src/assets/images/kalsubai_equirect_4k_final.jpg',
    panoramaLabel: 'Illustrative 360° Sample',
    viewerHeaderTitle: 'Kalsubai Summit',
    viewerSupportingLine:
      'High-resolution illustrative 360° equirectangular summit environment inspired by the Sahyadri range.',
    dragHintText: 'Drag to explore 360°',
    disclaimer:
      'High-resolution illustrative 360° equirectangular summit environment inspired by the Sahyadri range, demonstrating interactive panoramic previewing rather than field-captured survey footage.',
    viewerAriaLabel: 'Kalsubai Summit 360-degree immersive preview',
    loadingTitle: 'Loading 360° Summit Panorama',
    loadingSubtitle: 'Preparing high-resolution equirectangular mountain view…',
    helpTitle: 'Exploring the 360° Summit View',
    initialYawDeg: -105,
    initialPitchDeg: 0,
    defaultFov: 70,
    minFov: 38,
    maxFov: 84,
    hotspots: [
      {
        id: 'summit-viewpoint',
        indexLabel: '01',
        title: 'Summit Viewpoint',
        subtitle: 'Weathered Basalt Crest & Mountain Spur',
        categoryLabel: 'Summit Crest',
        description:
          'The final stretch opens up to weathered volcanic basalt and a narrow spur perched on the crest. From here, you can inspect both the rocky crown underfoot and the open Sahyadri skyline.',
        supportingDetail: '1,646 m crest context · Open basalt footing',
        spherical: { yawDeg: -99, pitchDeg: -10 },
      },
      {
        id: 'surrounding-valley',
        indexLabel: '02',
        title: 'Surrounding Valley',
        subtitle: 'Deep Sahyadri Basin & Morning Mist',
        categoryLabel: 'Valley Horizon',
        description:
          'Layered mountain ridges stretch into the distance above steep forested slopes and deep Sahyadri basins settled beneath early-morning mist.',
        supportingDetail: 'Western Ghats topography · Mist-filled lower basin',
        spherical: { yawDeg: -27, pitchDeg: -6 },
      },
      {
        id: 'sunrise-view',
        indexLabel: '03',
        title: 'Sunrise View',
        subtitle: 'Eastern Dawn Horizon & Soft Cloud Light',
        categoryLabel: 'Eastern Dawn',
        description:
          'Watch the first light spread above the eastern ridge, casting warm golden highlights across terraced crests while keeping the valleys below in cool pre-dawn shadow.',
        supportingDetail: 'Morning light orientation · Eastern ridge',
        spherical: { yawDeg: -142, pitchDeg: 7 },
      },
    ],
    audioChannels: [
      {
        id: 'mountain-wind',
        label: 'Mountain Wind',
        shortLabel: 'Wind',
        description: 'Synthesized ridge breeze gusts',
      },
    ],
  },
};

const ALIBAUG_BUNDLE: DestinationBundle = {
  destination: {
    id: 'alibaug-night-camping',
    name: 'Alibaug Night Camping',
    shortName: 'Alibaug Camping',
    categoryLabel: 'Coastal Beach Overnight',
    regionLine: 'Maharashtra, India · Konkan Coast (Raigad District)',
    tagline: 'Settling into a quiet Arabian Sea shoreline between bonfire glow and starlight.',
    intro:
      'Along the Konkan coast roughly 95 km south of Mumbai, Alibaug’s palm-lined beaches trade steep mountain ascents for open dark sand, gentle Arabian Sea surf, warm evening bonfires, and unhurried coastal nights.',
    cardLocationLabel: 'Konkan Coast, Raigad',
    cardHighlightLabel: 'Coastal Setting',
    cardHighlightValue: 'Arabian Sea Shoreline',
    cardSecondaryLabel: 'Sample Format',
    cardSecondaryValue: 'Overnight Tent Camp (Sample)',
    heroImageUrl: '/src/assets/images/alibaug_midnight_hero_1795537060161.jpg',
    heroImageAlt:
      'Empty boutique beach campsite on the Konkan coast at night with warmly lit canvas bell tents, empty wooden chairs beside a glowing driftwood bonfire, and moonlit Arabian Sea waves',
    cardImageUrl: '/src/assets/images/alibaug_midnight_hero_1795537060161.jpg',
    cardImageAlt:
      'Empty boutique beach campsite on the Konkan coast at night with warmly lit canvas bell tents, empty wooden chairs beside a glowing driftwood bonfire, and moonlit Arabian Sea waves',
    sidebarImageUrl: '/src/assets/images/alibaug_beach_atmosphere_1795534345795.jpg',
    sidebarImageAlt:
      'Moonlit Arabian Sea waves washing across dark wet Alibaug sand beneath coconut palm silhouettes and starry midnight sky',
    sidebarCaptionTitle: 'Night Coastline · Editorial Photography',
    sidebarCaptionText:
      'Once evening shore breezes settle, open beach stretches grow remarkably quiet—leaving only tide rhythm, moonlit surf, and clear night horizons.',
    beforeYouGoHeadline: 'Feel the coastal night before you pack.',
    beforeYouGoDescription:
      'Step inside an interactive 360° beach campsite after sunset. Look between lantern-lit tents, empty chairs beside the warm bonfire, moonlit Arabian Sea waves, and the starry sky—and optionally mix ocean waves, night breeze, and crackling fire.',
    beforeYouGoNote:
      'Transparency note: Generated 360° scenery is illustrative until authentic Alibaug field footage is acquired, and does not depict a specific commercial campsite operator.',
    beforeYouGoHint: 'Drag to look · 4 viewpoints · 3 optional sound layers',
    exploreCtaLabel: 'Explore this camp in 360°',
    overviewKicker: 'Destination Overview',
    overviewHeading: 'Salt air, driftwood firelight, and an open sea horizon',
    stagesHeading: 'Sample Overnight Rhythm',
    stagesSubtitle: 'Illustrative prototype evening-to-morning flow',
    notesHeading: 'Sample Camp Preparation Notes',
    facts: [
      {
        id: 'coastline',
        label: 'Coastal Region',
        value: 'Alibaug, Raigad',
        note: 'Verified · Konkan Coast, Arabian Sea',
        sourceType: 'verified',
      },
      {
        id: 'access',
        label: 'Typical Approach',
        value: 'Mandwa Ferry / Road',
        note: 'Verified · South of Mumbai Harbor',
        sourceType: 'verified',
      },
      {
        id: 'pace',
        label: 'Activity Intensity',
        value: 'Easy / Relaxed',
        note: 'Sample · Level beach terrain, no trekking',
        sourceType: 'sample',
      },
      {
        id: 'stay',
        label: 'Typical Stay Window',
        value: 'Late afternoon – 10 AM',
        note: 'Sample · Illustrative overnight cadence',
        sourceType: 'sample',
      },
    ],
    overviewParagraphs: [
      'Unlike pre-dawn Sahyadri summit climbs, Alibaug night camping revolves around slow coastal stillness. Pitched tents sit just above the high-tide sand line beneath coconut palms and casuarina trees, facing out over the Arabian Sea.',
      'This Phase 2 MyTravWay demonstration lets you preview how the night environment feels spatially and acoustically—balancing the warm amber contrast of a driftwood bonfire and soft tent lanterns against cool moonlit shoreline surf and an open starry sky.',
    ],
    sampleRouteStages: [
      {
        stageNumber: '01',
        title: 'Late Afternoon Arrival & Shoreline Orientation',
        elevationNote: 'Sample rhythm · Golden hour setup',
        description:
          'Arrive near sunset to settle into pitched shoreline tents, watch the Arabian Sea shift from amber to midnight navy, and take in the open beach.',
      },
      {
        stageNumber: '02',
        title: 'Bonfire Lighting & Evening Stillness',
        elevationNote: 'Sample rhythm · Warm sand circle',
        description:
          'As sea air cools after dusk, a small driftwood fire illuminates the central sand circle and empty canvas chairs facing the water.',
      },
      {
        stageNumber: '03',
        title: 'Moonlit Tide Walks & Stargazing',
        elevationNote: 'Sample rhythm · Low ambient light',
        description:
          'Follow the wet waterline beneath open stars to listen to steady ocean swells and trace moonlight reflecting across the dark sea horizon.',
      },
      {
        stageNumber: '04',
        title: 'Calm Coastal Morning & First Light',
        elevationNote: 'Sample rhythm · Early sea light',
        description:
          'Wake to pastel dawn reflections on glassy morning surf, cool sand underfoot, and an unhurried breakfast beside the open tent doorway.',
      },
    ],
    samplePreparationNotes: [
      'Sample note: Pack a light cotton hoodie or windcheater—coastal humidity drops noticeably after midnight.',
      'Sample note: Bring sandals easy to rinse of fine beach sand and a small torch or headlamp for late shoreline walks.',
      'Sample note: Store electronics in zip pouches to protect against fine sea mist and sand grains.',
      'Prototype disclosure: Sample overnight pacing, activities, and packing suggestions are illustrative only and do not represent guaranteed inclusions or a live MyTravWay booking.',
    ],
    storySectionTitle: 'Imagine Your Moments',
    storySectionSubtitle: 'Every destination has its own little moments.',
    storyDisclosure:
      'Aspirational storytelling themes only—illustrative environmental imagery depicting the mood of the coast rather than guaranteed activities included in a travel package.',
    storyMoments: [
      {
        id: 'the-coastal-escape',
        indexLabel: '01',
        title: 'The Coastal Escape',
        momentType: 'Evening · Storytelling theme',
        caption:
          'A peaceful evening with the sea in front of you and the city far behind.',
        imageUrl: '/src/assets/images/story_coastal_escape_1795537059823.jpg',
        imageAlt:
          'Two empty wooden-frame canvas chairs beside a glowing brass lantern on dark beach sand facing the calm moonlit Arabian Sea',
      },
      {
        id: 'the-little-things',
        indexLabel: '02',
        title: 'The Little Things',
        momentType: 'Nightfall · Storytelling theme',
        caption:
          'Warm lanterns, soft sand, a glowing bonfire and the sound of gentle waves.',
        imageUrl: '/src/assets/images/story_little_things_1795537060929.jpg',
        imageAlt:
          'Glowing driftwood bonfire beside a woven sand mat, warm brass camp lantern, and softly illuminated open canvas tent facing dark ocean waves',
      },
      {
        id: 'the-midnight-sky',
        indexLabel: '03',
        title: 'The Midnight Sky',
        momentType: 'Midnight · Storytelling theme',
        caption:
          'A quiet night under the stars, with the ocean stretching into the distance.',
        imageUrl: '/src/assets/images/story_midnight_sky_1795537061399.jpg',
        imageAlt:
          'Wide starry midnight navy sky and soft moonlit clouds arching over the Arabian Sea shoreline and palm silhouettes',
      },
      {
        id: 'the-first-light',
        indexLabel: '04',
        title: 'The First Light',
        momentType: 'Dawn · Storytelling theme',
        caption:
          'The transition from a peaceful night to the first light of morning.',
        imageUrl: '/src/assets/images/story_peaceful_morning_1795534347240.jpg',
        imageAlt:
          'Open canvas tent doorway looking out over calm early morning ocean waves with two steaming ceramic cups on a wooden crate',
      },
    ],
  },
  experience: {
    destinationId: 'alibaug-night-camping',
    themeId: 'midnight-coastal',
    panoramaUrl: '/src/assets/images/alibaug_midnight_equirect_4k.jpg',
    panoramaLabel: 'Illustrative 360° Sample',
    viewerHeaderTitle: 'ALIBAUG',
    viewerHeaderSubtitle: 'Night Camping Experience',
    viewerSupportingLine: 'An evening by the sea, away from the noise of the city.',
    dragHintText: 'Drag to explore your surroundings',
    disclaimer:
      'Illustrative 360° equirectangular night beach-camping scenery inspired by Alibaug’s Konkan coastline, shown until authentic field-captured Alibaug footage is acquired.',
    viewerAriaLabel: 'Alibaug Night Camping 360-degree immersive preview',
    loadingTitle: 'Loading 360° Midnight Beach Escape',
    loadingSubtitle: 'Preparing high-resolution equirectangular coastal night view…',
    helpTitle: 'Exploring the 360° Night Camp',
    initialYawDeg: -119,
    initialPitchDeg: -4,
    defaultFov: 72,
    minFov: 38,
    maxFov: 86,
    hotspots: [
      {
        id: 'campsite',
        indexLabel: '01',
        title: 'The Campsite',
        subtitle: 'Tents, Lanterns & Coastal Palms',
        categoryLabel: 'Shoreline Camp',
        description:
          'Your little corner by the coast. A peaceful campsite surrounded by the sea, soft lights and the quiet atmosphere of the night.',
        supportingDetail: 'Softly lit bell tents · Warm lanterns · Empty chairs on sand',
        spherical: { yawDeg: 166, pitchDeg: -3 },
      },
      {
        id: 'bonfire',
        indexLabel: '02',
        title: 'The Bonfire',
        subtitle: 'Warm Driftwood Glow & Empty Chairs',
        categoryLabel: 'Gathering Circle',
        description:
          'A glowing bonfire against the cool coastal night. The warmth of the flames creates a beautiful contrast with the moonlit beach.',
        supportingDetail: 'Natural driftwood fire · Warm amber sand glow · Empty seating',
        spherical: { yawDeg: -106, pitchDeg: -22 },
      },
      {
        id: 'beach-at-night',
        indexLabel: '03',
        title: 'The Moonlit Shore',
        subtitle: 'Arabian Sea Waves & Wet Sand',
        categoryLabel: 'Arabian Sea Edge',
        description:
          'Step towards the shoreline and look across the Arabian Sea. Soft waves, a distant horizon and moonlight reflecting across the water.',
        supportingDetail: 'Gentle coastal surf · Moonlight reflection · Wide open beach',
        spherical: { yawDeg: 0, pitchDeg: -4 },
      },
      {
        id: 'under-the-stars',
        indexLabel: '04',
        title: 'Under the Stars',
        subtitle: 'Midnight Navy Sky & Moonlit Clouds',
        categoryLabel: 'Midnight Sky',
        description:
          'Look up at the night sky. A quiet moment beneath the stars, with the sound of the sea in the background.',
        supportingDetail: 'Starry deep blue sky · Subtle moonlit clouds · Ocean horizon',
        spherical: { yawDeg: -5, pitchDeg: 34 },
      },
    ],
    audioChannels: [
      {
        id: 'ocean-waves',
        label: 'Ocean Waves',
        shortLabel: 'Waves',
        description: 'Rhythmic Arabian Sea shore swells',
      },
      {
        id: 'night-wind',
        label: 'Gentle Night Wind',
        shortLabel: 'Breeze',
        description: 'Soft coastal night air',
      },
      {
        id: 'bonfire-crackle',
        label: 'Bonfire Crackling',
        shortLabel: 'Bonfire',
        description: 'Warm driftwood embers and pops',
      },
    ],
  },
};

export const DESTINATIONS: Record<DestinationId, DestinationBundle> = {
  'kalsubai-summit': KALSUBAI_BUNDLE,
  'alibaug-night-camping': ALIBAUG_BUNDLE,
};

export const DESTINATION_LIST: DestinationBundle[] = [
  KALSUBAI_BUNDLE,
  ALIBAUG_BUNDLE,
];
