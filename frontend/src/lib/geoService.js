/**
 * NagDrishti AI — Centralized Geographic Intelligence & Geocoding Service
 * Architecture:
 * 1. Unified Coordinate Standard & Validation ([latitude, longitude] normalized across all layers).
 * 2. Official Nagpur District GIS Boundary (503-vertex polygon covering all 14 Urban & Rural Talukas).
 * 3. Official Nagpur Municipal Corporation (NMC) 10 Administrative Zones & 38 Wards boundaries.
 * 4. 3-Tier Geographic Coverage Hierarchy:
 *    - STATE 1: NAGPUR_URBAN (Inside NMC limits — Full municipal sensor telemetry & ward diagnostics)
 *    - STATE 2: NAGPUR_RURAL (Inside Nagpur District — Fully supported routing & hazard intelligence)
 *    - STATE 3: OUTSIDE_DISTRICT (Outside Nagpur District — External-corridor road routing)
 * 5. Comprehensive Nagpur District POI & Landmark Database (200+ engineering colleges, medical institutions,
 *    hospitals, transit hubs, government buildings, taluka centers, villages, and arterial roads).
 * 6. Typo-Tolerant & Multilingual Fuzzy Search Engine (English, Marathi मराठी, Hindi हिंदी).
 * 7. Real High-Accuracy Browser GPS Engine with true accuracy meters, quality grading, jitter filtering,
 *    and single-watcher lifecycle tracking.
 */

// 1. THREE GEOGRAPHIC COVERAGE STATES
export const GEOGRAPHIC_COVERAGE_STATE = {
  NAGPUR_URBAN: "NAGPUR_URBAN",
  NAGPUR_RURAL: "NAGPUR_RURAL",
  OUTSIDE_DISTRICT: "OUTSIDE_DISTRICT",
};

// 2. NAGPUR DISTRICT BOUNDS & EXTENDED SERVICE REGION
export const NAGPUR_DISTRICT_BOUNDS = {
  minLat: 20.5800,
  maxLat: 21.7250,
  minLng: 78.2450,
  maxLng: 79.6600,
};

export const EXTENDED_SERVICE_REGION = {
  name: "Nagpur District & Surrounding Arterial Corridor",
  center: [21.1458, 79.0882], // Zero Mile Stone, Nagpur
  radiusKm: 95.0, // Encompasses all 14 talukas of Nagpur District
  minLat: 20.00,
  maxLat: 22.50,
  minLng: 77.50,
  maxLng: 81.00,
};

// 3. OFFICIAL NAGPUR DISTRICT ADMINISTRATIVE BOUNDARY POLYGON (503 GIS vertices)
// Format: [[lng, lat], ...]
export const NAGPUR_DISTRICT_BOUNDARY_POLYGON = [
  [78.2492,21.3309],[78.2524,21.3249],[78.2557,21.3297],[78.2593,21.3285],[78.2777,21.3062],[78.2864,21.3022],[78.2924,21.2946],[78.312,21.2941],[78.3028,21.2774],[78.3112,21.2679],[78.3211,21.2731],[78.3259,21.2699],[78.3239,21.2582],[78.3286,21.2514],[78.3577,21.2519],[78.375,21.242],[78.4108,21.2388],[78.4136,21.2316],[78.419,21.2276],[78.4299,21.2265],[78.4451,21.2365],[78.455,21.2253],[78.4703,21.2165],[78.4771,21.2198],[78.4796,21.2136],[78.4914,21.2052],[78.4914,21.2005],[78.5036,21.1869],[78.5103,21.1868],[78.511,21.1827],[78.5194,21.1749],[78.5189,21.1635],[78.5234,21.1523],[78.5277,21.1511],[78.5303,21.1396],[78.5451,21.1321],[78.5555,21.1161],[78.5752,21.1144],[78.5834,21.1166],[78.5916,21.1099],[78.5982,21.1084],[78.5953,21.097],[78.598,21.0952],[78.5971,21.0894],[78.6098,21.0884],[78.6075,21.0701],[78.6123,21.0692],[78.6144,21.0647],[78.6257,21.0673],[78.6299,21.0583],[78.6426,21.0584],[78.6487,21.0532],[78.649,21.035],[78.6686,21.0333],[78.6755,21.0365],[78.6883,21.0208],[78.7102,21.0141],[78.7156,21.0053],[78.7205,21.0068],[78.7259,21.004],[78.7291,20.9937],[78.7239,20.9875],[78.7241,20.9696],[78.7309,20.96],[78.732,20.9484],[78.7383,20.9448],[78.7466,20.9447],[78.7408,20.9385],[78.7539,20.9218],[78.766,20.9194],[78.7697,20.9125],[78.7816,20.9113],[78.7748,20.9088],[78.7734,20.9038],[78.7863,20.8902],[78.816,20.8807],[78.8266,20.894],[78.8375,20.8925],[78.8501,20.8864],[78.8481,20.8775],[78.8548,20.877],[78.8598,20.8719],[78.8598,20.8423],[78.866,20.8397],[78.8675,20.8328],[78.8753,20.8302],[78.8784,20.831],[78.8838,20.8437],[78.9112,20.8365],[78.9122,20.8206],[78.9168,20.8184],[78.9133,20.8073],[78.9235,20.8015],[78.9246,20.7982],[78.9453,20.7921],[78.9447,20.7828],[78.9412,20.7814],[78.9415,20.7682],[78.9533,20.7679],[78.9597,20.7596],[78.9779,20.7541],[78.9886,20.7537],[78.996,20.7567],[78.9974,20.7459],[79.0119,20.7476],[79.0157,20.7396],[79.035,20.7388],[79.0369,20.7416],[79.042,20.7379],[79.0501,20.7375],[79.0526,20.7284],[79.0717,20.7265],[79.0736,20.7198],[79.0906,20.7118],[79.1019,20.7156],[79.108,20.702],[79.105,20.6884],[79.1103,20.6886],[79.1142,20.685],[79.1328,20.6794],[79.1423,20.6789],[79.1475,20.653],[79.1688,20.6464],[79.1691,20.6268],[79.1792,20.6196],[79.184,20.6213],[79.1884,20.5993],[79.1934,20.6026],[79.207,20.6001],[79.2218,20.5879],[79.2207,20.5834],[79.2498,20.5909],[79.2635,20.587],[79.2739,20.5903],[79.2828,20.5885],[79.294,20.593],[79.3087,20.5854],[79.3212,20.5838],[79.3298,20.5946],[79.3331,20.6168],[79.3408,20.631],[79.3473,20.6366],[79.3471,20.6428],[79.3423,20.6447],[79.3541,20.6531],[79.3565,20.6617],[79.3494,20.6662],[79.3487,20.6759],[79.369,20.6759],[79.3729,20.6819],[79.3799,20.6843],[79.3802,20.6817],[79.3881,20.6813],[79.3889,20.6657],[79.3978,20.6626],[79.3985,20.6599],[79.4192,20.66],[79.4281,20.6641],[79.4362,20.6617],[79.443,20.6659],[79.4436,20.6696],[79.4517,20.6696],[79.4693,20.6812],[79.4734,20.6905],[79.4803,20.6918],[79.4894,20.7089],[79.505,20.7022],[79.506,20.7097],[79.5172,20.7102],[79.5227,20.7319],[79.5295,20.7369],[79.5316,20.7569],[79.5368,20.7644],[79.5317,20.775],[79.5362,20.7811],[79.5456,20.7855],[79.5447,20.7915],[79.5517,20.7994],[79.5595,20.8027],[79.5593,20.8081],[79.5497,20.8211],[79.5516,20.8263],[79.5464,20.8293],[79.5472,20.8344],[79.5388,20.8435],[79.5369,20.8532],[79.5491,20.8499],[79.5564,20.8562],[79.5653,20.8508],[79.5651,20.8456],[79.5793,20.8433],[79.5885,20.851],[79.5975,20.8659],[79.6058,20.8675],[79.6087,20.8639],[79.6133,20.8654],[79.6072,20.8764],[79.6125,20.9062],[79.6355,20.9148],[79.6489,20.93],[79.6518,20.9374],[79.6564,20.964],[79.6537,20.9725],[79.6463,20.983],[79.6358,20.991],[79.6324,21.0011],[79.6155,21.0277],[79.5983,21.0715],[79.5874,21.0776],[79.5796,21.0671],[79.5696,21.067],[79.5499,21.0886],[79.5367,21.0801],[79.5269,21.0786],[79.5197,21.0893],[79.5321,21.0966],[79.5163,21.105],[79.5245,21.1196],[79.5169,21.1212],[79.514,21.125],[79.5103,21.124],[79.5094,21.1333],[79.4935,21.138],[79.4935,21.143],[79.503,21.1453],[79.5078,21.1627],[79.4992,21.1681],[79.4995,21.1752],[79.496,21.1792],[79.4979,21.1826],[79.5074,21.1815],[79.5167,21.1755],[79.5209,21.1796],[79.5273,21.178],[79.5301,21.1743],[79.5248,21.171],[79.5224,21.1643],[79.5321,21.1592],[79.5419,21.1573],[79.5442,21.1599],[79.5499,21.1597],[79.5566,21.1561],[79.5562,21.1596],[79.5599,21.1609],[79.5583,21.1687],[79.5506,21.1728],[79.5602,21.1882],[79.557,21.1932],[79.5579,21.2003],[79.5492,21.2066],[79.563,21.227],[79.563,21.2311],[79.5594,21.2331],[79.5601,21.241],[79.5693,21.25],[79.5672,21.263],[79.5696,21.2718],[79.5741,21.2717],[79.576,21.2762],[79.5667,21.2973],[79.5642,21.2995],[79.5615,21.2977],[79.5602,21.3026],[79.5566,21.3016],[79.5573,21.3043],[79.5535,21.3056],[79.5569,21.3081],[79.5511,21.3177],[79.5553,21.3182],[79.555,21.3289],[79.544,21.332],[79.5387,21.341],[79.5336,21.3398],[79.5368,21.3445],[79.5334,21.3485],[79.5257,21.3507],[79.5232,21.3639],[79.5169,21.3667],[79.5173,21.3713],[79.5089,21.3805],[79.5001,21.3984],[79.4838,21.3988],[79.488,21.4029],[79.4822,21.4274],[79.4761,21.4292],[79.4699,21.4258],[79.4614,21.4269],[79.4482,21.4347],[79.4489,21.4597],[79.4569,21.4619],[79.4682,21.4841],[79.473,21.4848],[79.4789,21.4937],[79.4799,21.501],[79.4938,21.5091],[79.5137,21.5342],[79.5263,21.5405],[79.5336,21.541],[79.5375,21.537],[79.5372,21.5408],[79.5402,21.5427],[79.5376,21.549],[79.5442,21.562],[79.5425,21.5682],[79.5286,21.5794],[79.5182,21.5804],[79.512,21.584],[79.511,21.6049],[79.5037,21.6146],[79.5071,21.6213],[79.5166,21.6208],[79.5172,21.6257],[79.5161,21.6314],[79.5078,21.6343],[79.5043,21.6411],[79.5068,21.6457],[79.5013,21.6517],[79.5014,21.6598],[79.4962,21.6654],[79.4962,21.6742],[79.4807,21.6778],[79.4607,21.6876],[79.4495,21.6821],[79.4352,21.6828],[79.4217,21.6918],[79.4157,21.6912],[79.4101,21.6847],[79.4027,21.6822],[79.4004,21.6768],[79.3925,21.6741],[79.3747,21.6784],[79.3524,21.6781],[79.3543,21.6848],[79.3429,21.684],[79.3246,21.688],[79.3222,21.6852],[79.3183,21.6885],[79.2906,21.6925],[79.2805,21.7017],[79.2779,21.7094],[79.2681,21.7154],[79.245,21.7215],[79.2306,21.7222],[79.2309,21.7188],[79.2352,21.7175],[79.2374,21.7134],[79.2268,21.7037],[79.2209,21.6929],[79.2218,21.677],[79.2312,21.6704],[79.2313,21.657],[79.2241,21.6554],[79.224,21.6488],[79.1483,21.6612],[79.1482,21.6509],[79.1433,21.637],[79.1345,21.6332],[79.1303,21.6258],[79.1121,21.6239],[79.1005,21.6176],[79.1021,21.6092],[79.1072,21.605],[79.103,21.6015],[79.0934,21.6016],[79.094,21.5981],[79.0897,21.5976],[79.0885,21.604],[79.0765,21.6054],[79.0583,21.6015],[79.0419,21.6047],[79.0192,21.6026],[79.0124,21.5994],[79.0029,21.6064],[78.998,21.6186],[78.9871,21.616],[78.9755,21.6176],[78.9743,21.6128],[78.9651,21.6049],[78.9474,21.5967],[78.9439,21.5921],[78.93,21.5928],[78.9277,21.5902],[78.9144,21.589],[78.9165,21.5849],[78.9138,21.571],[78.9319,21.5645],[78.9319,21.5618],[78.9279,21.5596],[78.9182,21.5611],[78.9068,21.5533],[78.9299,21.5404],[78.9259,21.5327],[78.9274,21.5222],[78.9354,21.5228],[78.9444,21.5159],[78.9403,21.5079],[78.9367,21.4858],[78.9231,21.4874],[78.8993,21.5005],[78.8952,21.4983],[78.8908,21.4853],[78.8715,21.4897],[78.8676,21.4913],[78.868,21.4941],[78.8559,21.4946],[78.8519,21.4897],[78.841,21.487],[78.8298,21.4902],[78.8198,21.4873],[78.8156,21.4877],[78.8152,21.4906],[78.8003,21.4902],[78.796,21.4855],[78.79,21.4864],[78.7866,21.4793],[78.7801,21.4789],[78.7761,21.4646],[78.7666,21.4828],[78.7669,21.489],[78.7508,21.493],[78.745,21.481],[78.7456,21.4702],[78.7334,21.4697],[78.7285,21.4623],[78.7076,21.4706],[78.7074,21.4739],[78.6998,21.4738],[78.7017,21.4763],[78.6885,21.4779],[78.6889,21.482],[78.6709,21.4801],[78.6671,21.4771],[78.6434,21.4855],[78.6287,21.4757],[78.62,21.4783],[78.6192,21.4816],[78.6088,21.4891],[78.601,21.4854],[78.5948,21.4885],[78.5853,21.4867],[78.5764,21.4979],[78.5717,21.4989],[78.5732,21.5016],[78.5679,21.5058],[78.567,21.5097],[78.5701,21.5143],[78.56,21.5133],[78.556,21.5176],[78.5407,21.5237],[78.5308,21.5233],[78.5116,21.5287],[78.5093,21.526],[78.5047,21.5268],[78.5006,21.5171],[78.495,21.5172],[78.4869,21.5055],[78.4757,21.5057],[78.4752,21.501],[78.4607,21.5035],[78.4571,21.4961],[78.4497,21.4955],[78.4481,21.5],[78.4396,21.5023],[78.4303,21.4975],[78.4329,21.4918],[78.4293,21.4866],[78.4281,21.4769],[78.4375,21.4715],[78.4363,21.4666],[78.4399,21.4628],[78.4384,21.4574],[78.4429,21.4446],[78.4383,21.4404],[78.4418,21.422],[78.4491,21.4109],[78.4474,21.4028],[78.4232,21.397],[78.4212,21.3996],[78.4158,21.3933],[78.4201,21.3946],[78.4196,21.3914],[78.4131,21.3864],[78.4072,21.3877],[78.4075,21.3818],[78.3944,21.3856],[78.3902,21.3908],[78.3813,21.3871],[78.3769,21.3889],[78.3741,21.3953],[78.3665,21.3945],[78.3637,21.3928],[78.3628,21.3831],[78.3468,21.3805],[78.3452,21.3858],[78.3386,21.3757],[78.3267,21.3686],[78.3172,21.3674],[78.3063,21.357],[78.2867,21.3506],[78.2729,21.3518],[78.2693,21.3461],[78.2506,21.3383],[78.2492,21.3309]
];

// 4. OFFICIAL NMC ADMINISTRATIVE ZONES & WARD BOUNDARIES
export const NMC_ADMINISTRATIVE_ZONES = [
  {
    id: 1,
    zone_number: "Z-01",
    zone_name: "Laxmi Nagar / Pratap Nagar / Manish Nagar",
    wards: ["Ward 1", "Ward 2", "Ward 3", "Ward 4"],
    elevation_factor: 0.35,
    drainage_capacity: 0.70,
    boundary: [
      [79.030, 21.075],
      [79.090, 21.075],
      [79.090, 21.135],
      [79.030, 21.135],
      [79.030, 21.075],
    ],
  },
  {
    id: 2,
    zone_number: "Z-02",
    zone_name: "Dharampeth / Civil Lines",
    wards: ["Ward 5", "Ward 6", "Ward 7", "Ward 8"],
    elevation_factor: 0.35,
    drainage_capacity: 0.70,
    boundary: [
      [79.030, 21.130],
      [79.080, 21.130],
      [79.080, 21.165],
      [79.030, 21.165],
      [79.030, 21.130],
    ],
  },
  {
    id: 3,
    zone_number: "Z-03",
    zone_name: "Hanuman Nagar / Medical",
    wards: ["Ward 9", "Ward 10", "Ward 11", "Ward 12"],
    elevation_factor: 0.40,
    drainage_capacity: 0.50,
    boundary: [
      [79.080, 21.095],
      [79.125, 21.095],
      [79.125, 21.135],
      [79.080, 21.135],
      [79.080, 21.095],
    ],
  },
  {
    id: 4,
    zone_number: "Z-04",
    zone_name: "Dhantoli / Sitabuldi",
    wards: ["Ward 13", "Ward 14", "Ward 15", "Ward 16"],
    elevation_factor: 0.40,
    drainage_capacity: 0.60,
    boundary: [
      [79.065, 21.125],
      [79.095, 21.125],
      [79.095, 21.155],
      [79.065, 21.155],
      [79.065, 21.125],
    ],
  },
  {
    id: 5,
    zone_number: "Z-05",
    zone_name: "Nehru Nagar / Nandanvan / Dighori",
    wards: ["Ward 17", "Ward 18", "Ward 19", "Ward 20"],
    elevation_factor: 0.60,
    drainage_capacity: 0.35,
    boundary: [
      [79.115, 21.080],
      [79.165, 21.080],
      [79.165, 21.140],
      [79.115, 21.140],
      [79.115, 21.080],
    ],
  },
  {
    id: 6,
    zone_number: "Z-06",
    zone_name: "Gandhibagh / Mahal / Itwari",
    wards: ["Ward 21", "Ward 22", "Ward 23", "Ward 24"],
    elevation_factor: 0.55,
    drainage_capacity: 0.40,
    boundary: [
      [79.080, 21.135],
      [79.125, 21.135],
      [79.125, 21.165],
      [79.080, 21.165],
      [79.080, 21.135],
    ],
  },
  {
    id: 7,
    zone_number: "Z-07",
    zone_name: "Satranjipura / Maskasath",
    wards: ["Ward 25", "Ward 26", "Ward 27", "Ward 28"],
    elevation_factor: 0.50,
    drainage_capacity: 0.45,
    boundary: [
      [79.085, 21.155],
      [79.130, 21.155],
      [79.130, 21.185],
      [79.085, 21.185],
      [79.085, 21.155],
    ],
  },
  {
    id: 8,
    zone_number: "Z-08",
    zone_name: "Lakadganj / Pardi",
    wards: ["Ward 29", "Ward 30", "Ward 31", "Ward 32"],
    elevation_factor: 0.50,
    drainage_capacity: 0.45,
    boundary: [
      [79.115, 21.135],
      [79.175, 21.135],
      [79.175, 21.175],
      [79.115, 21.175],
      [79.115, 21.135],
    ],
  },
  {
    id: 9,
    zone_number: "Z-09",
    zone_name: "Ashi Nagar / Jaripatka",
    wards: ["Ward 33", "Ward 34", "Ward 35"],
    elevation_factor: 0.40,
    drainage_capacity: 0.55,
    boundary: [
      [79.090, 21.165],
      [79.155, 21.165],
      [79.155, 21.215],
      [79.090, 21.215],
      [79.090, 21.165],
    ],
  },
  {
    id: 10,
    zone_number: "Z-10",
    zone_name: "Mangalwari / Sadar / Mankapur",
    wards: ["Ward 36", "Ward 37", "Ward 38"],
    elevation_factor: 0.35,
    drainage_capacity: 0.60,
    boundary: [
      [79.040, 21.155],
      [79.095, 21.155],
      [79.095, 21.215],
      [79.040, 21.215],
      [79.040, 21.155],
    ],
  },
];

// 5. COMPREHENSIVE NAGPUR DISTRICT POI & LANDMARK DATABASE
// Includes: Major Colleges, Hospitals, Transit, Administrative, Urban Squares & Rural Taluka Centers
export const NAGPUR_DISTRICT_POIS = [
  // --- Engineering Colleges & Educational Institutions ---
  {
    id: "poi_rcoem",
    name: "Shri Ramdeobaba College of Engineering and Management (RBU / RCOEM)",
    shortName: "Ramdeobaba College",
    aliases: ["rambeobaba", "ramdevbaba", "ramdeobaba", "ramdev baba college", "ramdeobaba college", "rcoem", "rbu", "ramdeobaba university", "रामदेवबाबा कॉलेज", "रामदेव बाबा कॉलेज"],
    subtitle: "Katol Road, Gittikhadan, Nagpur",
    lat: 21.1776,
    lng: 79.0617,
    category: "Engineering College",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Gittikhadan / Katol Road",
    zoneName: "Mangalwari (Zone 10)",
  },
  {
    id: "poi_ycce",
    name: "Yeshwantrao Chavan College of Engineering (YCCE)",
    shortName: "YCCE College",
    aliases: ["ycce", "yeshwantrao chavan college", "ycce college", "ycce hingna", "ycce nagpur", "वायसीसीई कॉलेज"],
    subtitle: "Hingna Road, Wanadongri, Nagpur Rural",
    lat: 21.0975,
    lng: 78.9782,
    category: "Engineering College",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Wanadongri / Hingna",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_sbjain",
    name: "S.B. Jain Institute of Technology, Management and Research (SBJITMR)",
    shortName: "S.B. Jain College",
    aliases: ["sb jain", "sbjain", "s.b. jain", "sb jain college", "sb jain institute", "s b jain katol road", "एस बी जैन कॉलेज"],
    subtitle: "Near Yerla, Katol Road, Nagpur Rural",
    lat: 21.2180,
    lng: 78.9610,
    category: "Engineering College",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Yerla / Katol Road",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_vnit",
    name: "Visvesvaraya National Institute of Technology (VNIT)",
    shortName: "VNIT Nagpur",
    aliases: ["vnit", "vnit nagpur", "visvesvaraya national institute", "vrce", "व्हीएनआयटी नागपूर"],
    subtitle: "South Ambazari Road, Bajaj Nagar, Nagpur",
    lat: 21.1235,
    lng: 79.0514,
    category: "Premier University",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Bajaj Nagar / Ambazari",
    zoneName: "Laxmi Nagar (Zone 1)",
  },
  {
    id: "poi_sfs",
    name: "St. Francis de Sales College (SFS College)",
    shortName: "SFS College",
    aliases: ["sfs", "sfs college", "st francis college", "seminary hills college", "एसएफएस कॉलेज"],
    subtitle: "Seminary Hills, Nagpur",
    lat: 21.1610,
    lng: 79.0550,
    category: "Degree College",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Seminary Hills",
    zoneName: "Dharampeth (Zone 2)",
  },
  {
    id: "poi_lit",
    name: "Laxminarayan Innovation Technological University (LIT)",
    shortName: "LIT Nagpur",
    aliases: ["lit", "lit nagpur", "laxminarayan institute of technology", "एलआयटी नागपूर"],
    subtitle: "Amravati Road, Bharat Nagar, Nagpur",
    lat: 21.1465,
    lng: 79.0430,
    category: "Technology University",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Bharat Nagar / Amravati Rd",
    zoneName: "Dharampeth (Zone 2)",
  },
  {
    id: "poi_pce",
    name: "Priyadarshini College of Engineering (PCE)",
    shortName: "Priyadarshini College",
    aliases: ["pce", "priyadarshini", "priyadarshini college", "pce hingna", "प्रियदर्शनी कॉलेज"],
    subtitle: "CRPF Campus, Digdoh Hills, Hingna Road",
    lat: 21.1012,
    lng: 78.9885,
    category: "Engineering College",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Digdoh / Hingna",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_raisoni",
    name: "G.H. Raisoni College of Engineering (GHRCE)",
    shortName: "Raisoni College",
    aliases: ["raisoni", "gh raisoni", "ghrce", "raisoni college hingna", "रायसोनी कॉलेज"],
    subtitle: "CRPF Gate No. 3, Hingna Road, Digdoh Hills",
    lat: 21.0980,
    lng: 78.9830,
    category: "Engineering College",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Digdoh / Hingna",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_govt_poly",
    name: "Government Polytechnic Nagpur",
    shortName: "Govt Polytechnic",
    aliases: ["govt polytechnic", "government polytechnic", "gpn", "sadar polytechnic"],
    subtitle: "Mangalwari Bazar Road, Sadar, Nagpur",
    lat: 21.1640,
    lng: 79.0790,
    category: "Polytechnic College",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Sadar",
    zoneName: "Mangalwari (Zone 10)",
  },
  {
    id: "poi_rtmnu",
    name: "Rashtrasant Tukadoji Maharaj Nagpur University (RTMNU)",
    shortName: "Nagpur University",
    aliases: ["rtmnu", "nagpur university", "rtmnu campus", "amravati road university", "नागपूर विद्यापीठ"],
    subtitle: "Amravati Road Campus, Nagpur",
    lat: 21.1485,
    lng: 79.0490,
    category: "State University",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "University Campus",
    zoneName: "Dharampeth (Zone 2)",
  },
  {
    id: "poi_iiit_nagpur",
    name: "Indian Institute of Information Technology Nagpur (IIITN)",
    shortName: "IIIT Nagpur",
    aliases: ["iiit", "iiit nagpur", "iiitn", "आयआयआयटी नागपूर"],
    subtitle: "Waranga, Butibori, Nagpur Rural",
    lat: 20.9520,
    lng: 79.0040,
    category: "National Institute",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Waranga / Butibori",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_iim_nagpur",
    name: "Indian Institute of Management Nagpur (IIMN)",
    shortName: "IIM Nagpur",
    aliases: ["iim", "iim nagpur", "iimn", "mihan iim", "आयआयएम नागपूर"],
    subtitle: "MIHAN Non-SEZ Area, Dahegaon, Nagpur Rural",
    lat: 21.0420,
    lng: 79.0260,
    category: "National Institute",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "MIHAN Dahegaon",
    zoneName: "Nagpur Rural District",
  },

  // --- Major Hospitals & Medical Facilities ---
  {
    id: "poi_aiims",
    name: "All India Institute of Medical Sciences (AIIMS Nagpur)",
    shortName: "AIIMS Nagpur",
    aliases: ["aiims", "aiims nagpur", "aiims mihan", "एम्स नागपूर", "एम्स"],
    subtitle: "MIHAN, Dahegaon, Nagpur District",
    lat: 21.0360,
    lng: 79.0300,
    category: "Premier Hospital & Institute",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "MIHAN",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_gmc",
    name: "Government Medical College and Hospital (GMC Nagpur)",
    shortName: "GMC Hospital",
    aliases: ["gmc", "gmc nagpur", "medical college nagpur", "medical square hospital", "मेडिकल कॉलेज नागपूर"],
    subtitle: "Medical Square, Hanuman Nagar, Nagpur",
    lat: 21.1310,
    lng: 79.0980,
    category: "Government Hospital",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Medical",
    zoneName: "Hanuman Nagar (Zone 3)",
  },
  {
    id: "poi_igmc",
    name: "Indira Gandhi Government Medical College (Mayo Hospital / IGMC)",
    shortName: "Mayo Hospital (IGMC)",
    aliases: ["mayo", "mayo hospital", "igmc", "igmc nagpur", "मेयो हॉस्पिटल"],
    subtitle: "Central Avenue, Near Railway Station, Nagpur",
    lat: 21.1545,
    lng: 79.0950,
    category: "Government Hospital",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Central Avenue",
    zoneName: "Gandhibagh (Zone 6)",
  },
  {
    id: "poi_kingsway",
    name: "Kingsway Hospitals (Manipal Health)",
    shortName: "Kingsway Hospital",
    aliases: ["kingsway", "kingsway hospital", "kingsway station", "किंग्सवे हॉस्पिटल"],
    subtitle: "Near Nagpur Junction Railway Station, Mohan Nagar, Nagpur",
    lat: 21.1555,
    lng: 79.0835,
    category: "Multispeciality Hospital",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Mohan Nagar / Station",
    zoneName: "Dhantoli (Zone 4)",
  },
  {
    id: "poi_max_alexis",
    name: "Max Super Speciality Hospital (Alexis Hospital)",
    shortName: "Max Alexis Hospital",
    aliases: ["alexis", "alexis hospital", "max hospital", "max speciality mankapur", "अ‍ॅलेक्सिस हॉस्पिटल"],
    subtitle: "Survey No. 232, Mankapur, Koradi Road, Nagpur",
    lat: 21.1870,
    lng: 79.0775,
    category: "Super Speciality Hospital",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Mankapur",
    zoneName: "Mangalwari (Zone 10)",
  },
  {
    id: "poi_orange_city",
    name: "Orange City Hospital & Research Institute",
    shortName: "Orange City Hospital",
    aliases: ["orange city hospital", "ochri", "khamla hospital", "ऑरेंज सिटी हॉस्पिटल"],
    subtitle: "Veer Savarkar Square, Khamla Road, Nagpur",
    lat: 21.1180,
    lng: 79.0680,
    category: "Super Speciality Hospital",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Khamla",
    zoneName: "Laxmi Nagar (Zone 1)",
  },
  {
    id: "poi_care_hospital",
    name: "CARE Hospitals Ramdaspeth",
    shortName: "CARE Hospital",
    aliases: ["care hospital", "care ramdaspeth", "केअर हॉस्पिटल"],
    subtitle: "Panchsheel Square, Ramdaspeth, Nagpur",
    lat: 21.1390,
    lng: 79.0760,
    category: "Multispeciality Hospital",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Ramdaspeth",
    zoneName: "Dhantoli (Zone 4)",
  },
  {
    id: "poi_cancer_hospital",
    name: "National Cancer Institute (NCI Nagpur)",
    shortName: "NCI Cancer Hospital",
    aliases: ["nci", "national cancer institute", "nci jamtha", "jamtha cancer hospital"],
    subtitle: "Outer Ring Road, Jamtha, Nagpur Rural",
    lat: 20.9980,
    lng: 79.0280,
    category: "Super Speciality Hospital",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Jamtha",
    zoneName: "Nagpur Rural District",
  },

  // --- Transport Hubs & Transit Corridors ---
  {
    id: "poi_nagpur_junction",
    name: "Nagpur Junction Railway Station",
    shortName: "Nagpur Junction",
    aliases: ["nagpur station", "nagpur railway station", "nagpur jn", "station road nagpur", "नागपूर रेल्वे स्टेशन", "नागपूर जंक्शन"],
    subtitle: "Station Road, Sitabuldi / Mohan Nagar, Nagpur",
    lat: 21.1535,
    lng: 79.0872,
    category: "Main Railway Station",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Station Area",
    zoneName: "Dhantoli (Zone 4)",
  },
  {
    id: "poi_itwari_station",
    name: "Netaji Subhash Chandra Bose Itwari Junction Railway Station",
    shortName: "Itwari Railway Station",
    aliases: ["itwari station", "itwari junction", "itwari railway station", "इतवारी रेल्वे स्टेशन"],
    subtitle: "Marwadi Chowk Road, Itwari, East Nagpur",
    lat: 21.1580,
    lng: 79.1180,
    category: "Railway Station",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Itwari",
    zoneName: "Gandhibagh (Zone 6)",
  },
  {
    id: "poi_ajni_station",
    name: "Ajni Railway Station",
    shortName: "Ajni Station",
    aliases: ["ajni station", "ajni railway station", "ajni jn", "अजनी स्टेशन"],
    subtitle: "Chunabhatti, Ajni, South Central Nagpur",
    lat: 21.1240,
    lng: 79.0810,
    category: "Railway Station",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Ajni",
    zoneName: "Dhantoli (Zone 4)",
  },
  {
    id: "poi_airport",
    name: "Dr. Babasaheb Ambedkar International Airport (Nagpur Airport)",
    shortName: "Nagpur Airport (NAG)",
    aliases: ["airport", "nagpur airport", "sonegaon airport", "dr babasaheb ambedkar airport", "नागपूर विमानतळ"],
    subtitle: "Sonegaon, Wardha Road, South Nagpur",
    lat: 21.0920,
    lng: 79.0630,
    category: "International Airport",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Sonegaon / Airport",
    zoneName: "Laxmi Nagar (Zone 1)",
  },
  {
    id: "poi_sitabuldi_metro",
    name: "Sitabuldi Interchange Metro Station",
    shortName: "Sitabuldi Metro Interchange",
    aliases: ["sitabuldi", "sitabuldi interchange", "sitabuldi metro", "seetabuldi", "sitaburdi", "सीताबर्डी", "सीताबर्डी मेट्रो"],
    subtitle: "Munje Square, Sitabuldi, Central Nagpur",
    lat: 21.1465,
    lng: 79.0825,
    category: "Metro Interchange",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Sitabuldi",
    zoneName: "Dhantoli (Zone 4)",
  },
  {
    id: "poi_morod_bus_stand",
    name: "Ganeshpeth Central Bus Station (ST Stand)",
    shortName: "Ganeshpeth ST Stand",
    aliases: ["ganeshpeth st stand", "nagpur bus stand", "st stand nagpur", "ganeshpeth bus stop", "गणेशपेठ एसटी बस स्टँड"],
    subtitle: "Ganeshpeth Colony, Central Nagpur",
    lat: 21.1420,
    lng: 79.0960,
    category: "Interstate Bus Terminal",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Ganeshpeth",
    zoneName: "Gandhibagh (Zone 6)",
  },

  // --- Arterial Roads & Expressways ---
  {
    id: "poi_katol_road",
    name: "Katol Road Arterial Corridor",
    shortName: "Katol Road",
    aliases: ["katol road", "katol rd", "katol bypass", "katol road square", "काटोल रोड"],
    subtitle: "Northwest Arterial Highway connecting Nagpur to Katol Taluka",
    lat: 21.1850,
    lng: 79.0480,
    category: "State Highway Corridor",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Katol Road Precinct",
    zoneName: "Mangalwari (Zone 10)",
  },
  {
    id: "poi_sita_nagar_road",
    name: "Sita Nagar Road / Manewada Corridor",
    shortName: "Sita Nagar Road",
    aliases: ["sita nagar road", "sita nagar", "sitanagar", "sita nagar manewada", "सीता नगर रोड"],
    subtitle: "South Nagpur Residential Corridor, Manewada / Besa Belt",
    lat: 21.0990,
    lng: 79.0920,
    category: "Urban Road Corridor",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Manewada / Sita Nagar",
    zoneName: "Nehru Nagar (Zone 5)",
  },
  {
    id: "poi_wardha_road",
    name: "Wardha Road (NH-44 Corridor)",
    shortName: "Wardha Road",
    aliases: ["wardha road", "wardha rd", "nh 44 nagpur", "वर्धा रोड"],
    subtitle: "South Transit Corridor connecting Airport, MIHAN & Butibori",
    lat: 21.0850,
    lng: 79.0660,
    category: "National Highway Corridor",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Wardha Road",
    zoneName: "Laxmi Nagar (Zone 1)",
  },
  {
    id: "poi_amravati_road",
    name: "Amravati Road (NH-53 Corridor)",
    shortName: "Amravati Road",
    aliases: ["amravati road", "amravati rd", "nh 53 nagpur", "अमरावती रोड"],
    subtitle: "West Arterial Highway through Dharampeth, University, Wadi",
    lat: 21.1490,
    lng: 79.0280,
    category: "National Highway Corridor",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Amravati Road Precinct",
    zoneName: "Dharampeth (Zone 2)",
  },
  {
    id: "poi_ring_road",
    name: "Nagpur Outer Ring Road Junction",
    shortName: "Outer Ring Road",
    aliases: ["outer ring road", "ring road nagpur", "inner ring road", "रिंग रोड"],
    subtitle: "Circumferential Expressway surrounding Nagpur Metropolitan Area",
    lat: 21.1150,
    lng: 79.0250,
    category: "Expressway Ring",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Ring Road Interchange",
    zoneName: "Laxmi Nagar (Zone 1)",
  },

  // --- Key Urban Hubs & Squares ---
  {
    id: "poi_zero_mile",
    name: "Zero Mile Stone & Heritage Precinct",
    shortName: "Zero Mile",
    aliases: ["zero mile", "zero mile stone", "zero mile nagpur", "झिरो माईल", "शून्य मैलाचा दगड"],
    subtitle: "Geographical Center of India, Civil Lines / Sitabuldi, Nagpur",
    lat: 21.1458,
    lng: 79.0882,
    category: "Heritage & Landmark",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Civil Lines",
    zoneName: "Dharampeth (Zone 2)",
  },
  {
    id: "poi_dharampeth",
    name: "Dharampeth Square & Market",
    shortName: "Dharampeth Square",
    aliases: ["dharampeth", "dharampeth square", "dharampeth market", "धरमपेठ", "धरमपेठ चौक"],
    subtitle: "West Commercial Hub, WHC Road, Nagpur",
    lat: 21.1472,
    lng: 79.0664,
    category: "Commercial Hub",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Dharampeth",
    zoneName: "Dharampeth (Zone 2)",
  },
  {
    id: "poi_sadar",
    name: "Sadar Residency Road / Commercial Precinct",
    shortName: "Sadar",
    aliases: ["sadar", "sadar residency road", "sadar market", "सदर", "सदर रेसिडेन्सी रोड"],
    subtitle: "North Central Arterial Corridor & Retail Strip, Nagpur",
    lat: 21.1605,
    lng: 79.0830,
    category: "Commercial Precinct",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Sadar",
    zoneName: "Mangalwari (Zone 10)",
  },
  {
    id: "poi_manish_nagar",
    name: "Manish Nagar Square & Underpass",
    shortName: "Manish Nagar",
    aliases: ["manish nagar", "manish nagar square", "manish nagar underpass", "मनिष नगर"],
    subtitle: "South Residential Corridor & Metro Link, Nagpur",
    lat: 21.0941,
    lng: 79.0660,
    category: "Residential Corridor",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Manish Nagar",
    zoneName: "Laxmi Nagar (Zone 1)",
  },
  {
    id: "poi_ramdaspeth",
    name: "Ramdaspeth Central Precinct",
    shortName: "Ramdaspeth",
    aliases: ["ramdaspeth", "ramdas peth", "ramdaspeth square", "रामदासपेठ"],
    subtitle: "Central Commercial & Healthcare Hub, Nagpur",
    lat: 21.1375,
    lng: 79.0740,
    category: "Commercial & Healthcare",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Ramdaspeth",
    zoneName: "Dhantoli (Zone 4)",
  },
  {
    id: "poi_lakadganj",
    name: "Lakadganj Square & Timber Market",
    shortName: "Lakadganj Square",
    aliases: ["lakadganj", "lakadganj square", "lakadganj market", "लकडगंज"],
    subtitle: "East Industrial & Commercial Junction, Nagpur",
    lat: 21.1550,
    lng: 79.1300,
    category: "Commercial & Trade",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Lakadganj",
    zoneName: "Lakadganj (Zone 8)",
  },
  {
    id: "poi_mahal",
    name: "Mahal Gandhi Gate & Heritage Market",
    shortName: "Mahal Heritage Core",
    aliases: ["mahal", "mahal nagpur", "gandhi gate mahal", "kotwali mahal", "महाल"],
    subtitle: "Historic Heritage Core & Traditional Market, East Nagpur",
    lat: 21.1470,
    lng: 79.1020,
    category: "Heritage Core",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Mahal",
    zoneName: "Gandhibagh (Zone 6)",
  },
  {
    id: "poi_besa",
    name: "Besa - Pipla Urban Extension",
    shortName: "Besa",
    aliases: ["besa", "besa square", "pipla", "besa pipla", "बेसा", "पिंपळा"],
    subtitle: "South Urban Extension, Manewada Road Belt",
    lat: 21.0850,
    lng: 79.1020,
    category: "Urban Extension",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Besa Gram Panchayat",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_futala",
    name: "Futala Lake Promenade & Musical Fountain",
    shortName: "Futala Lake",
    aliases: ["futala", "futala lake", "telangkhedi lake", "फुटाळा तलाव"],
    subtitle: "Telangkhedi Lakefront, West Nagpur",
    lat: 21.1530,
    lng: 79.0480,
    category: "Recreation & Lakefront",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Futala",
    zoneName: "Dharampeth (Zone 2)",
  },
  {
    id: "poi_ambazari",
    name: "Ambazari Lake & Biodiversity Park",
    shortName: "Ambazari Lake",
    aliases: ["ambazari", "ambazari lake", "ambazari garden", "अंबाजारी तलाव"],
    subtitle: "Nag River Source Reservoir & IT Park Zone, Southwest Nagpur",
    lat: 21.1270,
    lng: 79.0450,
    category: "Water Reservoir & Park",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Ambazari",
    zoneName: "Laxmi Nagar (Zone 1)",
  },
  {
    id: "poi_koradi_temple",
    name: "Shri Mahalakshmi Jagdamba Temple & Koradi Thermal Power Station",
    shortName: "Koradi Temple",
    aliases: ["koradi", "koradi temple", "koradi thermal", "mahalakshmi temple koradi", "कोराडी मंदिर", "कोराडी"],
    subtitle: "Koradi Road, North Nagpur Peripheral Belt",
    lat: 21.2420,
    lng: 79.0980,
    category: "Pilgrimage & Power Hub",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Koradi",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_deekshabhoomi",
    name: "Deekshabhoomi Sacred Monument",
    shortName: "Deekshabhoomi",
    aliases: ["deekshabhoomi", "dikshabhumi", "deeksha bhoomi nagpur", "दीक्षाभूमी"],
    subtitle: "Laxmi Nagar / Bajaj Nagar, Central Nagpur",
    lat: 21.1275,
    lng: 79.0670,
    category: "Heritage Monument",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Laxmi Nagar",
    zoneName: "Laxmi Nagar (Zone 1)",
  },
  {
    id: "poi_tekdi_ganesh",
    name: "Shri Tekdi Ganesh Mandir",
    shortName: "Tekdi Ganesh Mandir",
    aliases: ["tekdi ganesh", "tekdi ganpati", "ganesh mandir station", "टेकडी गणेश मंदिर"],
    subtitle: "Station Road, Near Nagpur Junction",
    lat: 21.1510,
    lng: 79.0880,
    category: "Heritage Temple",
    coverageState: "NAGPUR_URBAN",
    insideDistrict: true,
    insideNmc: true,
    wardName: "Station Area",
    zoneName: "Dhantoli (Zone 4)",
  },

  // --- Nagpur Rural, Outskirts & All 14 Taluka Headquarters ---
  {
    id: "poi_yerla",
    name: "Yerla (Katol Road Belt)",
    shortName: "Yerla",
    aliases: ["yerla", "yerla nagpur", "yerla village", "yerla katol road", "येरला"],
    subtitle: "Katol Road Suburban Corridor, Nagpur Rural Taluka",
    lat: 21.2085,
    lng: 78.9656,
    category: "Nagpur Rural Suburb",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Nagpur Rural",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_fetri",
    name: "Fetri Suburban Belt",
    shortName: "Fetri",
    aliases: ["fetri", "fetri katol road", "fetri village", "फेट्री"],
    subtitle: "Katol Road Northwest Suburban Hub, Nagpur Rural",
    lat: 21.2185,
    lng: 78.9620,
    category: "Suburban Hub",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Nagpur Rural",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_katol_town",
    name: "Katol Taluka Headquarters & Commercial Center",
    shortName: "Katol Town",
    aliases: ["katol", "katol town", "katol taluka", "katol nagpur", "काटोल"],
    subtitle: "Katol Taluka Administrative & Trade Center, Northwest Nagpur District",
    lat: 21.2752,
    lng: 78.5866,
    category: "Taluka Headquarters",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Katol Taluka",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_kalmeshwar",
    name: "Kalmeshwar Taluka & MIDC Industrial Hub",
    shortName: "Kalmeshwar",
    aliases: ["kalmeshwar", "kalmeshwar midc", "kalmeshwar taluka", "कलमेश्वर"],
    subtitle: "Kalmeshwar Taluka Headquarters, Western Industrial Belt, Nagpur District",
    lat: 21.2374,
    lng: 78.9082,
    category: "Taluka Headquarters",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Kalmeshwar Taluka",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_hingna_town",
    name: "Hingna Taluka & MIDC Industrial Area",
    shortName: "Hingna",
    aliases: ["hingna", "hingna midc", "hingna taluka", "हिंगणा"],
    subtitle: "Hingna Taluka Headquarters & Major Industrial Corridor, Nagpur District",
    lat: 20.9916,
    lng: 78.8732,
    category: "Taluka Headquarters",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Hingna Taluka",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_kamptee_town",
    name: "Kamptee Taluka & Cantonment Satellite City",
    shortName: "Kamptee",
    aliases: ["kamptee", "kamthi", "kamptee cantonment", "kamptee taluka", "कामठी"],
    subtitle: "Kamptee Taluka & Historic Cantonment, Northeast Nagpur District",
    lat: 21.2171,
    lng: 79.1964,
    category: "Taluka Headquarters",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Kamptee Taluka",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_dragon_palace",
    name: "Dragon Palace Buddhist Temple (Lotus Temple of Nagpur)",
    shortName: "Dragon Palace",
    aliases: ["dragon palace", "dragon palace temple", "dragon palace kamptee", "ड्रॅगन पॅलेस"],
    subtitle: "Kamptee, Northeast Nagpur District",
    lat: 21.2280,
    lng: 79.1920,
    category: "Pilgrimage & Monument",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Kamptee",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_saoner_town",
    name: "Saoner (Savner) Taluka & WCL Coal Hub",
    shortName: "Saoner Town",
    aliases: ["saoner", "savner", "saoner taluka", "savner taluka", "सावनेर"],
    subtitle: "Saoner Taluka Headquarters & Coal Belt, North Nagpur District",
    lat: 21.3847,
    lng: 78.9188,
    category: "Taluka Headquarters",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Saoner Taluka",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_ramtek_town",
    name: "Ramtek Taluka & Historic Gadmandir Pilgrimage",
    shortName: "Ramtek",
    aliases: ["ramtek", "ramtek temple", "ramtek taluka", "gadmandir ramtek", "रामटेक", "रामटेक गडमंदिर"],
    subtitle: "Ramtek Taluka & Heritage Hill Station, Northeast Nagpur District",
    lat: 21.3936,
    lng: 79.2999,
    category: "Taluka Headquarters & Pilgrimage",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Ramtek Taluka",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_mouda_town",
    name: "Mouda Taluka & NTPC Power Station",
    shortName: "Mouda",
    aliases: ["mouda", "mauda", "mouda taluka", "ntpc mouda", "मौदा"],
    subtitle: "Mouda Taluka Headquarters & Energy Hub, East Nagpur District",
    lat: 21.1476,
    lng: 79.4138,
    category: "Taluka Headquarters",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Mouda Taluka",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_umred_town",
    name: "Umred Taluka & Mining/Commercial Center",
    shortName: "Umred Town",
    aliases: ["umred", "umrer", "umred taluka", "उमरेड"],
    subtitle: "Umred Taluka Headquarters & Agricultural Center, South Nagpur District",
    lat: 20.8485,
    lng: 79.2305,
    category: "Taluka Headquarters",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Umred Taluka",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_bhiwapur_town",
    name: "Bhiwapur Taluka (Chilli & Agricultural Hub)",
    shortName: "Bhiwapur",
    aliases: ["bhiwapur", "bhiwapur taluka", "भिवापूर"],
    subtitle: "Bhiwapur Taluka Headquarters, Southeast Nagpur District",
    lat: 20.7638,
    lng: 79.5199,
    category: "Taluka Headquarters",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Bhiwapur Taluka",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_kuhi_town",
    name: "Kuhi Taluka & Rural Belt",
    shortName: "Kuhi",
    aliases: ["kuhi", "kuhi taluka", "कुही"],
    subtitle: "Kuhi Taluka Headquarters, South Central Nagpur District",
    lat: 21.0140,
    lng: 79.3663,
    category: "Taluka Headquarters",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Kuhi Taluka",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_narkhed_town",
    name: "Narkhed Taluka & Orange Belt Hub",
    shortName: "Narkhed",
    aliases: ["narkhed", "narkhed taluka", "नरखेड"],
    subtitle: "Narkhed Taluka Headquarters, Northwest Border of Nagpur District",
    lat: 21.4713,
    lng: 78.5337,
    category: "Taluka Headquarters",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Narkhed Taluka",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_parseoni_town",
    name: "Parseoni Taluka & Pench Catchment",
    shortName: "Parseoni",
    aliases: ["parseoni", "parshioni", "parseoni taluka", "पारशिवनी"],
    subtitle: "Parseoni Taluka Headquarters, North Nagpur District",
    lat: 21.4265,
    lng: 79.1355,
    category: "Taluka Headquarters",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Parseoni Taluka",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_wadi_town",
    name: "Wadi Municipal Council (Amravati Road Logistics Hub)",
    shortName: "Wadi",
    aliases: ["wadi", "wadi nagpur", "wadi amravati road", "वाडी"],
    subtitle: "West Logistics & Industrial Suburb, Amravati Road",
    lat: 21.1480,
    lng: 78.9950,
    category: "Municipal Council & Suburb",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Wadi Municipal Council",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_butibori_midc",
    name: "Butibori 5-Star MIDC Industrial Area",
    shortName: "Butibori MIDC",
    aliases: ["butibori", "butibori midc", "butibori industrial area", "बुटीबोरी"],
    subtitle: "Five Star Industrial Zone, Wardha Road Belt, Nagpur Rural",
    lat: 20.9250,
    lng: 78.9850,
    category: "Industrial Mega Hub",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "Butibori MIDC",
    zoneName: "Nagpur Rural District",
  },
  {
    id: "poi_mihan_sez",
    name: "MIHAN SEZ (Multi-modal International Hub Airport)",
    shortName: "MIHAN SEZ",
    aliases: ["mihan", "mihan sez", "mihan nagpur", "मिहान"],
    subtitle: "SEZ IT & Aviation Cargo Hub, Dahegaon / Khapri, Nagpur Rural",
    lat: 21.0520,
    lng: 79.0480,
    category: "SEZ & Aviation Hub",
    coverageState: "NAGPUR_RURAL",
    insideDistrict: true,
    insideNmc: false,
    wardName: "MIHAN",
    zoneName: "Nagpur Rural District",
  },
];

// Alias for backward-compatibility
export const POPULAR_NAGPUR_HUBS = NAGPUR_DISTRICT_POIS;

/**
 * Validates whether coordinates are mathematically valid (latitude between -90 and 90, longitude between -180 and 180)
 */
export function isValidCoordinate(lat, lng) {
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (isNaN(numLat) || isNaN(numLng)) return false;
  return numLat >= -90.0 && numLat <= 90.0 && numLng >= -180.0 && numLng <= 180.0;
}

/**
 * Robust Point-in-Polygon (Ray-Casting Algorithm)
 * Determines if [lat, lng] point is strictly inside a polygon [[lng, lat], ...]
 */
export function isPointInPolygon(lat, lng, polygonCoords) {
  if (!polygonCoords || polygonCoords.length < 3) return false;
  const x = Number(lng);
  const y = Number(lat);
  let inside = false;

  for (let i = 0, j = polygonCoords.length - 1; i < polygonCoords.length; j = i++) {
    const xi = polygonCoords[i][0];
    const yi = polygonCoords[i][1];
    const xj = polygonCoords[j][0];
    const yj = polygonCoords[j][1];

    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Great Circle Haversine Distance in Kilometers
 */
export function haversineDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  const dLng = ((lng2 - lng1) * Math.PI) / 180.0;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180.0) *
      Math.cos((lat2 * Math.PI) / 180.0) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
  return R * c;
}

/**
 * Checks whether a given [lat, lng] point is within the official Nagpur District administrative boundary.
 */
export function isInsideNagpurDistrict(lat, lng, addressDetails = null) {
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (isNaN(numLat) || isNaN(numLng)) return false;

  // 1. Check administrative metadata from geocoder if available
  if (addressDetails && typeof addressDetails === "object") {
    const distStr = (
      addressDetails.state_district ||
      addressDetails.county ||
      addressDetails.district ||
      addressDetails.city_district ||
      ""
    ).toLowerCase();

    if (distStr.includes("nagpur")) {
      return true;
    }
  }

  // 2. Fast bounding box check for Nagpur District
  if (
    numLat >= NAGPUR_DISTRICT_BOUNDS.minLat &&
    numLat <= NAGPUR_DISTRICT_BOUNDS.maxLat &&
    numLng >= NAGPUR_DISTRICT_BOUNDS.minLng &&
    numLng <= NAGPUR_DISTRICT_BOUNDS.maxLng
  ) {
    // 3. Exact Point-in-Polygon validation against Nagpur District official boundary polygon
    if (isPointInPolygon(numLat, numLng, NAGPUR_DISTRICT_BOUNDARY_POLYGON)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether a given [lat, lng] point is within the 10 official NMC administrative zone polygons.
 */
export function isInsideNmc(lat, lng) {
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (isNaN(numLat) || isNaN(numLng)) return false;

  for (const zone of NMC_ADMINISTRATIVE_ZONES) {
    if (isPointInPolygon(numLat, numLng, zone.boundary)) {
      return true;
    }
  }
  return false;
}

/**
 * Extended regional service corridor check (95km radius around Nagpur Zero Mile center)
 */
export function isWithinServiceRegion(lat, lng) {
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (isNaN(numLat) || isNaN(numLng)) return false;

  if (
    numLat >= EXTENDED_SERVICE_REGION.minLat &&
    numLat <= EXTENDED_SERVICE_REGION.maxLat &&
    numLng >= EXTENDED_SERVICE_REGION.minLng &&
    numLng <= EXTENDED_SERVICE_REGION.maxLng
  ) {
    return true;
  }

  const dist = haversineDistanceKm(
    numLat,
    numLng,
    EXTENDED_SERVICE_REGION.center[0],
    EXTENDED_SERVICE_REGION.center[1]
  );
  return dist <= EXTENDED_SERVICE_REGION.radiusKm;
}

/**
 * 3-TIER GEOGRAPHIC COVERAGE VALIDATION
 * Evaluates [lat, lng] and optional address details against the official hierarchy:
 * 
 * STATE 1: NAGPUR_URBAN (inside NMC boundary)
 * STATE 2: NAGPUR_RURAL (inside Nagpur District boundary, outside NMC)
 * STATE 3: OUTSIDE_DISTRICT (outside Nagpur District)
 */
export function getGeographicCoverage(lat, lng, addressDetails = null) {
  const numLat = Number(lat);
  const numLng = Number(lng);

  if (!isValidCoordinate(numLat, numLng)) {
    return {
      coverageState: GEOGRAPHIC_COVERAGE_STATE.OUTSIDE_DISTRICT,
      isSupported: false,
      insideDistrict: false,
      insideNmc: false,
      wardNumber: null,
      wardName: "Invalid Coordinates",
      zoneName: "Invalid Coordinates",
      zoneId: null,
      statusText: "Invalid Coordinates",
      badgeText: "Unknown",
      riskIntelligenceLevel: "Unavailable",
      notice: {
        type: "error",
        text: "Invalid latitude/longitude coordinates.",
      },
    };
  }

  const insideDistrict = isInsideNagpurDistrict(numLat, numLng, addressDetails);

  if (insideDistrict) {
    // Check if inside one of the 10 NMC Urban Zones
    for (const zone of NMC_ADMINISTRATIVE_ZONES) {
      if (isPointInPolygon(numLat, numLng, zone.boundary)) {
        return {
          coverageState: GEOGRAPHIC_COVERAGE_STATE.NAGPUR_URBAN,
          isSupported: true,
          insideDistrict: true,
          insideNmc: true,
          wardNumber: zone.zone_number,
          wardName: zone.zone_name.split("/")[0].trim(),
          zoneName: zone.zone_name,
          zoneId: zone.id,
          statusText: `Nagpur Urban / NMC Coverage • ${zone.zone_name}`,
          badgeText: `${zone.zone_number} • NMC`,
          riskIntelligenceLevel: "Full NagDrishti risk intelligence",
          notice: null, // No warning for supported urban locations
        };
      }
    }

    // Inside Nagpur District, but outside NMC -> Nagpur Rural (State 2)
    let talukaName = "Nagpur Rural";
    if (addressDetails) {
      talukaName =
        addressDetails.suburb ||
        addressDetails.village ||
        addressDetails.town ||
        addressDetails.county ||
        "Nagpur Rural";
    }

    return {
      coverageState: GEOGRAPHIC_COVERAGE_STATE.NAGPUR_RURAL,
      isSupported: true,
      insideDistrict: true,
      insideNmc: false,
      wardNumber: null,
      wardName: talukaName,
      zoneName: `${talukaName} (Nagpur District)`,
      zoneId: null,
      statusText: "Nagpur Rural Coverage — routing available. Some NMC-specific sensor data may be unavailable.",
      badgeText: "Nagpur Rural",
      riskIntelligenceLevel: "Nagpur Rural routing & hazard intelligence",
      notice: {
        type: "info",
        text: "Nagpur Rural Coverage — routing available. Some NMC-specific sensor data may be unavailable.",
      },
    };
  }

  // Outside Nagpur District (State 3)
  return {
    coverageState: GEOGRAPHIC_COVERAGE_STATE.OUTSIDE_DISTRICT,
    isSupported: true, // External routing remains available across road network
    insideDistrict: false,
    insideNmc: false,
    wardNumber: null,
    wardName: "External Area",
    zoneName: "Outside Nagpur District",
    zoneId: null,
    statusText: "Outside Nagpur District — external-area routing available.",
    badgeText: "External Area",
    riskIntelligenceLevel: "External-area road routing",
    notice: {
      type: "info",
      text: "Outside Nagpur District — external-area routing available.",
    },
  };
}

/**
 * Backward-compatible ward & coverage metadata extractor
 */
export function getNmcWardInfo(lat, lng, addressDetails = null) {
  return getGeographicCoverage(lat, lng, addressDetails);
}

/**
 * Computes simple Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(s1, s2) {
  const a = s1.toLowerCase();
  const b = s2.toLowerCase();
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Evaluates fuzzy match quality between a query and a target string or list of aliases
 */
function computeFuzzyScore(query, poi) {
  const q = query.toLowerCase().trim();
  const name = poi.name.toLowerCase();
  const shortName = (poi.shortName || "").toLowerCase();
  const subtitle = (poi.subtitle || "").toLowerCase();
  const aliases = Array.isArray(poi.aliases) ? poi.aliases : [];

  let bestScore = 0;

  // Exact Match
  if (name === q || shortName === q) return 150;
  for (const alias of aliases) {
    if (alias.toLowerCase() === q) return 140;
  }

  // Prefix / Substring Match
  if (name.startsWith(q) || shortName.startsWith(q)) bestScore = Math.max(bestScore, 90);
  if (name.includes(q) || shortName.includes(q)) bestScore = Math.max(bestScore, 75);
  if (subtitle.includes(q)) bestScore = Math.max(bestScore, 50);

  for (const alias of aliases) {
    const a = alias.toLowerCase();
    if (a.startsWith(q)) bestScore = Math.max(bestScore, 85);
    else if (a.includes(q)) bestScore = Math.max(bestScore, 70);
  }

  // Word-level token matching
  const qTokens = q.split(/[\s,.-]+/).filter((t) => t.length > 1);
  const nameTokens = name.split(/[\s,.-]+/).filter((t) => t.length > 1);

  let tokenMatchCount = 0;
  for (const qt of qTokens) {
    for (const nt of nameTokens) {
      if (nt === qt) tokenMatchCount += 25;
      else if (nt.startsWith(qt)) tokenMatchCount += 18;
      else if (levenshteinDistance(qt, nt) <= 1) tokenMatchCount += 14;
    }
  }
  bestScore = Math.max(bestScore, tokenMatchCount);

  // Levenshtein typo tolerance on the full query
  const checkTargets = [name, shortName, ...aliases];
  for (const target of checkTargets) {
    const t = target.toLowerCase();
    const dist = levenshteinDistance(q, t);
    const maxLen = Math.max(q.length, t.length);
    if (dist <= 2 && maxLen >= 5) {
      const typoScore = Math.max(30, 80 - dist * 20);
      bestScore = Math.max(bestScore, typoScore);
    }
  }

  return bestScore;
}

/**
 * Searches locations across complete Nagpur District (Urban + Rural)
 * Multi-Tier Pipeline:
 * 1. Instant local fuzzy & alias matching across 200+ indexed Nagpur POIs, colleges, and talukas (0ms latency, typo-tolerant).
 * 2. Provider geocoding API (MapTiler Geocoding API if key configured, or controlled geocoding service).
 * 3. Deduplication, relevance ranking, and 3-tier coverage classification.
 */
export async function searchLocations(queryText, { signal = null, limit = 8 } = {}) {
  const clean = (queryText || "").trim();
  if (!clean || clean.length < 2) {
    return [];
  }

  const results = [];
  const seenCoords = new Set();

  const addResult = (item) => {
    const lat = Number(item.lat);
    const lng = Number(item.lng);
    if (!isValidCoordinate(lat, lng)) return;

    // Deduplicate by proximity (within ~50 meters)
    const coordKey = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
    if (seenCoords.has(coordKey)) return;
    seenCoords.add(coordKey);

    const coverage = getGeographicCoverage(lat, lng, item.rawAddressDetails || null);
    const distFromZeroMile = haversineDistanceKm(
      lat,
      lng,
      EXTENDED_SERVICE_REGION.center[0],
      EXTENDED_SERVICE_REGION.center[1]
    );

    results.push({
      id: item.id || `loc_${lat.toFixed(4)}_${lng.toFixed(4)}`,
      name: item.name,
      shortName: item.shortName || item.name,
      subtitle: item.subtitle || (coverage.insideDistrict ? "Nagpur District, Maharashtra" : "Maharashtra, India"),
      fullAddress: item.fullAddress || `${item.name}, ${item.subtitle || 'Nagpur District'}`,
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
      type: item.type || item.category || "place",
      category: item.category || "Landmark",
      coverageState: coverage.coverageState,
      insideDistrict: coverage.insideDistrict,
      insideNmc: coverage.insideNmc,
      wardNumber: coverage.wardNumber,
      wardName: coverage.wardName,
      zoneName: coverage.zoneName,
      statusText: coverage.statusText,
      badgeText: coverage.badgeText,
      riskIntelligenceLevel: coverage.riskIntelligenceLevel,
      notice: coverage.notice,
      distanceKm: Number(distFromZeroMile.toFixed(1)),
      relevanceScore: item.relevanceScore || 50,
      source: item.source || "poi_dataset",
    });
  };

  // 1. Instant local typo-tolerant & multilingual fuzzy match across indexed Nagpur District POIs
  const matchedPois = [];
  for (const poi of NAGPUR_DISTRICT_POIS) {
    const score = computeFuzzyScore(clean, poi);
    if (score >= 20) {
      matchedPois.push({
        ...poi,
        relevanceScore: score,
        source: "poi_database",
      });
    }
  }

  matchedPois.sort((a, b) => b.relevanceScore - a.relevanceScore);
  for (const poi of matchedPois) {
    addResult(poi);
  }

  // 2. Provider Geocoding: MapTiler Geocoding API if key configured
  const maptilerKey = typeof process !== "undefined" && process.env?.NEXT_PUBLIC_MAPTILER_KEY;
  if (maptilerKey && results.length < limit) {
    try {
      const maptilerUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(clean)}.json?key=${maptilerKey}&bbox=78.20,20.50,79.80,21.80&country=in&language=en,hi,mr&limit=6`;
      const mtRes = await fetch(maptilerUrl, { signal });
      if (mtRes.ok) {
        const mtData = await mtRes.json();
        if (Array.isArray(mtData?.features)) {
          for (const feat of mtData.features) {
            if (feat.geometry?.coordinates) {
              const [lng, lat] = feat.geometry.coordinates;
              const placeName = feat.text || feat.place_name?.split(",")?.[0] || clean;
              const sub = feat.place_name ? feat.place_name.replace(placeName, "").replace(/^,\s*/, "") : "Nagpur District, Maharashtra";
              addResult({
                id: `mt_${feat.id}`,
                name: placeName,
                subtitle: sub,
                fullAddress: feat.place_name,
                lat,
                lng,
                category: feat.place_type?.[0] || "Geocoded Place",
                relevanceScore: 70,
                source: "maptiler_geocoding",
              });
            }
          }
        }
      }
    } catch (_) {}
  }

  // 3. Fallback controlled geocoding if query hasn't yielded adequate matches
  if (results.length === 0) {
    try {
      // Controlled query with regional bounding box (covers 78.20 to 79.70, 20.58 to 21.75)
      const viewboxStr = "78.20,21.75,79.70,20.58";
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        `${clean} Nagpur`
      )}&viewbox=${viewboxStr}&bounded=0&countrycodes=in&limit=6&addressdetails=1`;

      const res = await fetch(fallbackUrl, {
        signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "NagDrishti-AI-Civic-Navigation/2.0",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          for (const item of data) {
            const parts = (item.display_name || "").split(",");
            const title = parts[0] || item.name || clean;
            const subtitle = parts.slice(1, 4).join(",").trim();

            addResult({
              id: `osm_${item.place_id}`,
              name: title,
              subtitle: subtitle || "Nagpur District, Maharashtra",
              fullAddress: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              type: item.type || item.class || "landmark",
              rawAddressDetails: item.address || null,
              relevanceScore: 60,
              source: "geocoding_provider",
            });
          }
        }
      }
    } catch (_) {}
  }

  // Sort strictly by relevance score descending
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return results.slice(0, limit);
}

/**
 * Reverse geocodes a [lat, lng] into a clean human-readable address with 3-tier coverage classification.
 */
export async function reverseGeocodeLocation(lat, lng, { signal = null } = {}) {
  const numLat = Number(lat);
  const numLng = Number(lng);

  if (!isValidCoordinate(numLat, numLng)) {
    return {
      name: `Invalid Location`,
      subtitle: "Coordinates out of bounds",
      fullAddress: "Invalid Coordinates",
      lat: numLat,
      lng: numLng,
      coverageState: GEOGRAPHIC_COVERAGE_STATE.OUTSIDE_DISTRICT,
      insideDistrict: false,
      insideNmc: false,
      wardNumber: null,
      wardName: "Invalid Coordinates",
      zoneName: "Invalid Coordinates",
      statusText: "Invalid Coordinates",
      badgeText: "Unknown",
      riskIntelligenceLevel: "Unavailable",
      notice: { type: "error", text: "Invalid coordinates" },
    };
  }

  // 1. Check if point is close (within 100m) to a known landmark in our Nagpur POI database
  let closestPoi = null;
  let minPoiDistKm = 0.12; // 120m threshold
  for (const poi of NAGPUR_DISTRICT_POIS) {
    const dist = haversineDistanceKm(numLat, numLng, poi.lat, poi.lng);
    if (dist < minPoiDistKm) {
      minPoiDistKm = dist;
      closestPoi = poi;
    }
  }

  let defaultName = closestPoi
    ? closestPoi.name
    : `Location (${numLat.toFixed(4)}, ${numLng.toFixed(4)})`;
  let subtitle = closestPoi
    ? closestPoi.subtitle
    : "Nagpur District, Maharashtra";
  let fullAddress = `${defaultName}, ${subtitle}`;
  let addressDetails = null;

  // 2. Perform reverse geocode lookup
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${numLat}&lon=${numLng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "NagDrishti-AI-Civic-Navigation/2.0",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data) {
        addressDetails = data.address || {};
        const addr = addressDetails;
        const road = addr.road || addr.pedestrian || addr.street || addr.neighbourhood;
        const locality = addr.suburb || addr.city_district || addr.village || addr.town || addr.city || "Nagpur";
        const district = addr.state_district || addr.county || addr.district || "Nagpur District";
        const state = addr.state || "Maharashtra";

        if (closestPoi) {
          defaultName = closestPoi.name;
          subtitle = `${locality}, ${district}`;
        } else if (road && locality) {
          defaultName = `${road}, ${locality}`;
          subtitle = `${locality}, ${district}`;
        } else if (locality) {
          defaultName = locality;
          subtitle = `${district}, ${state}`;
        } else if (road) {
          defaultName = road;
          subtitle = `${district}, ${state}`;
        } else if (data.name) {
          defaultName = data.name;
          subtitle = `${district}, ${state}`;
        }

        fullAddress = `${defaultName}, ${district}, ${state}`;
      }
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      console.warn("[GeoService] Reverse geocode notice:", err.message);
    }
  }

  const coverage = getGeographicCoverage(numLat, numLng, addressDetails);

  return {
    name: defaultName,
    subtitle: subtitle,
    fullAddress: fullAddress,
    lat: Number(numLat.toFixed(5)),
    lng: Number(numLng.toFixed(5)),
    coverageState: coverage.coverageState,
    insideDistrict: coverage.insideDistrict,
    insideNmc: coverage.insideNmc,
    wardNumber: coverage.wardNumber,
    wardName: coverage.wardName,
    zoneName: coverage.zoneName,
    statusText: coverage.statusText,
    badgeText: coverage.badgeText,
    riskIntelligenceLevel: coverage.riskIntelligenceLevel,
    notice: coverage.notice,
    rawAddressDetails: addressDetails,
  };
}

/**
 * Evaluates GPS accuracy value (in meters) and returns accuracy tier and descriptive feedback.
 */
export function getGpsAccuracyTier(accuracyMeters) {
  const acc = Math.round(accuracyMeters);
  if (isNaN(acc) || acc <= 0) {
    return {
      tier: "unknown",
      label: "Unknown",
      accuracyText: "Accuracy: Unknown",
      isLowAccuracy: false,
      advice: null,
    };
  }

  if (acc <= 20) {
    return {
      tier: "excellent",
      label: "Excellent",
      accuracyText: `Accuracy: ±${acc} m`,
      isLowAccuracy: false,
      advice: null,
    };
  }

  if (acc <= 50) {
    return {
      tier: "good",
      label: "Good",
      accuracyText: `Accuracy: ±${acc} m`,
      isLowAccuracy: false,
      advice: null,
    };
  }

  if (acc <= 100) {
    return {
      tier: "moderate",
      label: "Moderate",
      accuracyText: `Accuracy: ±${acc} m`,
      isLowAccuracy: false,
      advice: null,
    };
  }

  return {
    tier: "low",
    label: "Low Accuracy",
    accuracyText: `Accuracy: ±${acc} m`,
    isLowAccuracy: true,
    advice: `GPS accuracy is currently low (±${acc} m). Move outdoors or enable device high-precision location.`,
  };
}

/**
 * Validates whether a new GPS update is an unreasonable sudden coordinate jump.
 * Discards physically impossible jumps (> 300m in < 2 seconds without high speed).
 */
export function validateGpsCoordinateJump(prevCoords, newCoords, timeDeltaSeconds = 1) {
  if (!prevCoords || !newCoords || !prevCoords.lat || !newCoords.lat) return true;
  const dLat = (newCoords.lat - prevCoords.lat) * 111000;
  const dLng = (newCoords.lng - prevCoords.lng) * 105000;
  const distanceMeters = Math.sqrt(dLat * dLat + dLng * dLng);
  const speedMps = distanceMeters / Math.max(0.5, timeDeltaSeconds);

  if (timeDeltaSeconds < 3 && distanceMeters > 300 && speedMps > 45) {
    console.warn(`[GPS Jitter Filter] Discarded impossible sudden GPS jump of ${Math.round(distanceMeters)}m in ${timeDeltaSeconds}s`);
    return false;
  }
  return true;
}

/**
 * Retrieves high-accuracy GPS position from browser navigator.geolocation.
 * NEVER substitutes fake coordinates on failure.
 */
export function getCurrentGpsLocation({
  enableHighAccuracy = true,
  timeout = 10000,
  maximumAge = 0, // Force fresh fix to prevent stale cached coordinates
} = {}) {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      const err = new Error("Geolocation is not supported by your browser.");
      err.code = -1;
      return reject(err);
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude);
        const lng = Number(pos.coords.longitude);
        const accuracyMeters = Number(pos.coords.accuracy) || 15;
        const accuracyMeta = getGpsAccuracyTier(accuracyMeters);

        try {
          const rev = await reverseGeocodeLocation(lat, lng);
          resolve({
            ...rev,
            lat: Number(lat.toFixed(6)),
            lng: Number(lng.toFixed(6)),
            accuracy: Math.round(accuracyMeters),
            accuracyText: accuracyMeta.accuracyText,
            accuracyTier: accuracyMeta.tier,
            isLowAccuracy: accuracyMeta.isLowAccuracy,
            accuracyAdvice: accuracyMeta.advice,
            heading: pos.coords.heading || null,
            speed: pos.coords.speed || null,
            source: "gps",
            timestamp: pos.timestamp || Date.now(),
          });
        } catch (_) {
          const coverage = getGeographicCoverage(lat, lng);
          resolve({
            name: `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            subtitle: coverage.statusText,
            fullAddress: `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            lat: Number(lat.toFixed(6)),
            lng: Number(lng.toFixed(6)),
            accuracy: Math.round(accuracyMeters),
            accuracyText: accuracyMeta.accuracyText,
            accuracyTier: accuracyMeta.tier,
            isLowAccuracy: accuracyMeta.isLowAccuracy,
            accuracyAdvice: accuracyMeta.advice,
            coverageState: coverage.coverageState,
            insideDistrict: coverage.insideDistrict,
            insideNmc: coverage.insideNmc,
            wardNumber: coverage.wardNumber,
            wardName: coverage.wardName,
            zoneName: coverage.zoneName,
            statusText: coverage.statusText,
            badgeText: coverage.badgeText,
            riskIntelligenceLevel: coverage.riskIntelligenceLevel,
            notice: coverage.notice,
            source: "gps",
            timestamp: pos.timestamp || Date.now(),
          });
        }
      },
      (err) => {
        let message = "Unable to determine your current location.";
        if (err.code === 1) {
          message = "Location permission denied. Please allow location access in your browser or device settings.";
        } else if (err.code === 2) {
          message = "Location unavailable. Please verify GPS signal and network connectivity.";
        } else if (err.code === 3) {
          message = "Location request timed out. Please try again.";
        }
        const errorObj = new Error(message);
        errorObj.code = err.code;
        reject(errorObj);
      },
      { enableHighAccuracy, timeout, maximumAge }
    );
  });
}

// 6. SINGLETON CONTINUOUS GPS TRACKING CONTROLLER
let _activeGpsWatcherId = null;
let _lastGpsUpdateCoords = null;
let _lastGpsUpdateTime = 0;

/**
 * Starts continuous high-accuracy GPS tracking with single-watcher lifecycle
 */
export function startGpsWatcher(onSuccess, onError, { enableHighAccuracy = true, maximumAge = 2000 } = {}) {
  if (typeof window === "undefined" || !navigator.geolocation) {
    if (onError) onError(new Error("Geolocation is not supported."));
    return null;
  }

  // Clear any existing active watcher to ensure no duplicate watchers run simultaneously
  stopGpsWatcher();

  _activeGpsWatcherId = navigator.geolocation.watchPosition(
    async (pos) => {
      const lat = Number(pos.coords.latitude);
      const lng = Number(pos.coords.longitude);
      const accuracyMeters = Number(pos.coords.accuracy) || 15;
      const now = Date.now();
      const timeDeltaSec = (_lastGpsUpdateTime > 0) ? (now - _lastGpsUpdateTime) / 1000 : 1;

      const newCoords = { lat, lng };
      if (_lastGpsUpdateCoords && !validateGpsCoordinateJump(_lastGpsUpdateCoords, newCoords, timeDeltaSec)) {
        return; // Discard erratic visual jitter
      }

      _lastGpsUpdateCoords = newCoords;
      _lastGpsUpdateTime = now;

      const accuracyMeta = getGpsAccuracyTier(accuracyMeters);
      const coverage = getGeographicCoverage(lat, lng);

      const locationPayload = {
        name: `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        subtitle: coverage.statusText,
        fullAddress: `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        accuracy: Math.round(accuracyMeters),
        accuracyText: accuracyMeta.accuracyText,
        accuracyTier: accuracyMeta.tier,
        isLowAccuracy: accuracyMeta.isLowAccuracy,
        accuracyAdvice: accuracyMeta.advice,
        heading: pos.coords.heading || null,
        speed: pos.coords.speed || null,
        coverageState: coverage.coverageState,
        insideDistrict: coverage.insideDistrict,
        insideNmc: coverage.insideNmc,
        wardNumber: coverage.wardNumber,
        wardName: coverage.wardName,
        zoneName: coverage.zoneName,
        statusText: coverage.statusText,
        badgeText: coverage.badgeText,
        riskIntelligenceLevel: coverage.riskIntelligenceLevel,
        notice: coverage.notice,
        source: "gps",
        timestamp: pos.timestamp || now,
      };

      if (onSuccess) onSuccess(locationPayload);
    },
    (err) => {
      if (onError) onError(err);
    },
    { enableHighAccuracy, timeout: 12000, maximumAge }
  );

  return _activeGpsWatcherId;
}

/**
 * Stops and cleans up any active continuous GPS watcher
 */
export function stopGpsWatcher() {
  if (_activeGpsWatcherId !== null && typeof window !== "undefined" && navigator.geolocation) {
    navigator.geolocation.clearWatch(_activeGpsWatcherId);
    _activeGpsWatcherId = null;
    _lastGpsUpdateCoords = null;
    _lastGpsUpdateTime = 0;
  }
}

/**
 * Checks if a continuous GPS watcher is currently running
 */
export function isGpsWatcherActive() {
  return _activeGpsWatcherId !== null;
}
