// the list of counties which are participating in this siting tool
// countyfp (three-digit FIPS code) is used to link to a GeoJSON entry nmap behaviors
// see also getParticipatingCountyInfo() for a handy-dandy wrapper to fetch one of these county entries by countyfp
//
// datafootnote = optional footnote which will be added to map legend popups for that county
// outoforder = optional message to display in top-left of county page, indicating that this county data are questionable
// exceptlayers = skip these layers when loading the data profile, for counties to opt-out from individual layers
const PARTICIPATING_COUNTIES = [
    { countyfp: "001", name: "Hawaii", profile: "fullmodel", outoforder: "", datafootnote: "", exceptlayers: [] },
    { countyfp: "003", name: "Honolulu", profile: "fullmodel", outoforder: "", datafootnote: "", exceptlayers: [] },
    // { countyfp: "005", name: "Kalawao", profile: "lite", outoforder: "", datafootnote: "", exceptlayers: [] },
    { countyfp: "007", name: "Kauai", profile: "fullmodel", outoforder: "", datafootnote: "", exceptlayers: [] },
    { countyfp: "009", name: "Maui", profile: "fullmodel", outoforder: "", datafootnote: "", exceptlayers: [] },
];

const getParticipatingCountyInfo = function (countyfp) {
    // fetch the county entry, easy; be sure to take a copy because we're about to mutate it
    const entry = PARTICIPATING_COUNTIES.filter(function (c) { return c.countyfp == countyfp; })[0];
    if (! entry) throw new Error(`No county with countyfp = ${countyfp}`);
    if (! DATA_PROFILES[entry.profile]) throw new Error(`County ${countyfp} has invalid profile ${entry.profile}`);

    // add the data profile information (notably layers) for the county
    // then remove any layers where this county is specifically opted-out
    const returnme = Object.assign({}, entry);

    returnme.datalayers = Object.assign({}, DATA_PROFILES[entry.profile]);

    if (returnme.exceptlayers && returnme.exceptlayers.length) {
        returnme.datalayers.suggestedareas = returnme.datalayers.suggestedareas.filter(function (layerinfo) {
            return returnme.exceptlayers.indexOf(layerinfo.id) === -1;
        });
        returnme.datalayers.additionalareas = returnme.datalayers.additionalareas.filter(function (layerinfo) {
            return returnme.exceptlayers.indexOf(layerinfo.id) === -1;
        });
        returnme.datalayers.allareas = returnme.datalayers.allareas.filter(function (layerinfo) {
            return returnme.exceptlayers.indexOf(layerinfo.id) === -1;
        });
        returnme.datalayers.pointsofinterest = returnme.datalayers.pointsofinterest.filter(function (layerinfo) {
            return returnme.exceptlayers.indexOf(layerinfo.id) === -1;
        });
        returnme.datalayers.sitingcriteria = returnme.datalayers.sitingcriteria.filter(function (layerinfo) {
            return returnme.exceptlayers.indexOf(layerinfo.id) === -1;
        });
        returnme.datalayers.populationdata = returnme.datalayers.populationdata.filter(function (layerinfo) {
            return returnme.exceptlayers.indexOf(layerinfo.id) === -1;
        });
        returnme.datalayers.voterdata = returnme.datalayers.voterdata.filter(function (layerinfo) {
            return returnme.exceptlayers.indexOf(layerinfo.id) === -1;
        });
    };

    // // HI 005 (Kalawao) remove precincts
    // if (countyfp == '005') {
    //     const index = returnme.datalayers.pointsofinterest.indexOf(DATA_LAYERS.precincts);
    //     returnme.datalayers.pointsofinterest.splice(index, 1);
    // }

    // done
    return returnme;
};

// the style for drawing counties onto the statewide overview map,
// with different styles for participating counties vs non-participiating, and the different data profiles
const BOUNDSTYLE_DEFAULT = { fillColor: 'white', weight: 1, opacity: 0.5, color: 'black', fillOpacity: 0.5, smoothFactor: 0.5 };
const BOUNDSTYLE_PARTICIPATING = { fillColor: '#fecd1b', weight: 1, opacity: 0.5, color: 'black', fillOpacity: 0.5, smoothFactor: 0.5 };
const BOUNDSTYLE_FULL = { fillColor: '#fecd1b', weight: 1, opacity: 0.5, color: 'black', fillOpacity: 0.75, smoothFactor: 0.5 };
const BOUNDSTYLE_LITE = { fillColor: '#fecd1b', weight: 1, opacity: 0.5, color: 'black', fillOpacity: 0.33, smoothFactor: 0.5 };
const BOUNDSTYLE_MOUSEOVER = { weight: 5, color: 'black', fillOpacity: 0.15, smoothFactor: 0.5 };

// in county.html to view a single county, the style to use for county boundary
const SINGLECOUNTY_STYLE = { fill: false, weight: 2, opacity: 1, color: 'black' };

// for individual tracts in county view, the base style
const CENSUSTRACT_STYLE = { color: 'black', weight: 1, opacity: 0.25, fillColor: 'transparent', fillOpacity: 0.8, interactive: false };

// for the squares indicating a tract with unreliable data, the style
const UNRELIABLE_STYLE = { color: 'black', fillColor: 'black', fillOpacity: 0.8, stroke: false, interactive: false };

// to highlight a suggested area circle when its deails are being shown
const HIGHLIGHT_SUGGESTED_AREA = { color: 'yellow', weight: 2, fill: false };

// for circles & tracts with no data, a grey fill
const NODATA_COLOR = '#CCCCCC';

// a list of basemap options for the BasemapBar
const BASEMAP_OPTIONS = [
    {
        type: 'xyz',
        label: 'Map',
        url: 'https://api.mapbox.com/styles/v1/centerforinclusivedemocracy/ckixilce95t1c19pahszryk4r/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiY2VudGVyZm9yaW5jbHVzaXZlZGVtb2NyYWN5IiwiYSI6ImNraXhpb3BtbDJicnMyemxycXU3Yzc0czgifQ.YkVn97A1xO8ZD4_O6AGA7A',
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    },
    {
        type: 'xyz',
        label: 'Satellite',
        url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    },
];

// these color ramps will be used by several layers, which will be defined in DATA_PROFILES
const SCORING_COLOR_RAMP = [ '#f1eef6', '#d7b5d8', '#df65b0', '#dd1c77', '#980043' ];
const CRITERIA_COLOR_RAMP = [ '#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8', '#253494' ];

// list of site-scoring criteria from all_sites_scored.csv
// we loop over this to calculate stats in a few places, and it's also useful to have it here for documentation
const SITE_SCORING_FIELDS = [
    'dens.cvap.std',  // County Percentage of Voting Age Citizens
    'dens.work.std',  // County Worker Percentage
    'popDens.std',  // Population Density
    'prc.CarAccess.std',  // Percent of Population with Vehicle Access
    'prc.ElNonReg.std',  // Eligible Non-Registered Voter Rate
    'prc.disabled.std',  // Percent Disabled Population
    'prc.latino.std',  // Percent Latino Population
    'prc.nonEngProf.std',  // Percent Limited English Proficient Population
    'prc.pov.std',  // Percent of the Population in Poverty
    'prc.youth.std',  // Percent of Population Youth
    'rate.vbm.std',  // Vote by Mail Rate (Total)
    'dens.poll.std',  // Polling Place Voter Percentage
];


// profiles are what layers to offer for each county, since not all counties get all processing
// define the set of DATA_LAYERS that exist in the universe,
// then DATA_PROFILES which are sets of layers to offer to each county
//
// circle = for circle markers (point CSVs) a L.Path style for the circle, including a radius (meters)
// mapzindex  = for circle markers (point CSVs) their stacking order: low (default), medium, high, highest
// popupnamefield = for the popup when clicking circle markers (point CSVs) which CSV field to use as the name; undefined = no popup
// popuptypefield = for the popup when clicking circle markers (point CSVs) which CSV field to use as the type; may use popuptypetext instead
// popuptypetext = for the popup when clicking circle markers (point CSVs) a fixed string to display as the type; may use popuptypefield to read from CSV
// radiogroup = layers matching the same radiogroup will behave similarly to radio buttons: turning on one will turn off others in this same group
const DATA_LAYERS = {};

DATA_LAYERS.four_day_sites = {
    id: 'four_day_sites',
    title: "Suggested Areas for Election Day Voting Locations",
    csvfile: 'model_files/four_day_sites.csv',
    circle: { radius: 400, opacity: 0.8, color: 'black', weight: 1, fillColor: 'quantile', fillOpacity: 0.8 },
    quantilefield: 'center_score', quantilecolors: SCORING_COLOR_RAMP, // because fillColor == quantile
    mapzindex: 'high',
    legendformat: 'lowtohigh',
    downloadfile: 'model_files/four_day_sites_shp.zip',
    downloadtype: 'SHP',
    radiogroup: 'suggestedsites',
    layertype: 'sites'
};

DATA_LAYERS.eleven_day_sites = {
    id: 'eleven_day_sites',
    title: "Suggested Areas for Early Voting Locations",
    csvfile: 'model_files/eleven_day_sites.csv',
    circle: { radius: 400, opacity: 0.8, color: 'black', weight: 1, fillColor: 'quantile', fillOpacity: 0.8 },
    quantilefield: 'center_score', quantilecolors: SCORING_COLOR_RAMP, // because fillColor == quantile
    mapzindex: 'high',
    legendformat: 'lowtohigh',
    downloadfile: 'model_files/eleven_day_sites_shp.zip',
    downloadtype: 'SHP',
    radiogroup: 'suggestedsites',
    layertype: 'sites'
};
DATA_LAYERS.dropbox_sites = {
    id: 'dropbox_sites',
    title: "Suggested Areas for Ballot Drop Boxes",
    csvfile: 'model_files/dropbox_sites.csv',
    circle: { radius: 400, opacity: 0.8, color: 'red', weight: 1, fillColor: 'quantile', fillOpacity: 0.8 },
    quantilefield: 'droppoff_score', quantilecolors: SCORING_COLOR_RAMP, // because fillColor == quantile
    mapzindex: 'high',
    legendformat: 'lowtohigh',
    downloadfile: 'model_files/dropbox_sites_shp.zip',
    downloadtype: 'SHP',
    layertype: 'sites'
};
DATA_LAYERS.all_sites_scored = {
    id: 'all_sites_scored',
    title: "All Potential Areas",
    csvfile: 'model_files/all_sites_scored.csv',
    circle: { radius: 400, opacity: 0.8, color: '#fcc5c0', weight: 1, fillColor: 'quantile', fillOpacity: 0.8 },
    quantilefield: 'center_score', quantilecolors: SCORING_COLOR_RAMP, // because fillColor == quantile
    mapzindex: 'medium',
    legendformat: 'lowtohigh',
    downloadfile: 'model_files/all_sites_scored_shp.zip',
    downloadtype: 'SHP',
    layertype: 'sites'
};
DATA_LAYERS.additional_sites_model = {
    id: 'additional_sites_model',
    title: "Additional Voting Location Options Based on Model",
    csvfile: 'model_files/additional_sites_model.csv',
    circle: { radius: 400, opacity: 0.8, color: 'blue', weight: 1, fillColor: 'quantile', fillOpacity: 0.8 },
    quantilefield: 'center_score', quantilecolors: SCORING_COLOR_RAMP, // because fillColor == quantile
    mapzindex: 'high',
    legendformat: 'lowtohigh',
    downloadfile: 'model_files/additional_sites_model_shp.zip',
    downloadtype: 'SHP',
    radiogroup: 'additionalsites',
    layertype: 'sites'
};
DATA_LAYERS.additional_sites_distance = {
    id: 'additional_sites_distance',
    title: "Additional Voting Location Options Based on Distance",
    csvfile: 'model_files/additional_sites_distance.csv',
    circle: { radius: 400, opacity: 0.8, color: 'blue', weight: 1, fillColor: 'quantile', fillOpacity: 0.8 },
    quantilefield: 'center_score', quantilecolors: SCORING_COLOR_RAMP, // because fillColor == quantile
    mapzindex: 'high',
    legendformat: 'lowtohigh',
    downloadfile: 'model_files/additional_sites_distance_shp.zip',
    downloadtype: 'SHP',
    radiogroup: 'additionalsites',
    layertype: 'sites'
};
DATA_LAYERS.cvapdens = {
    id: 'cvapdens',
    title: "Percent of County Voting Age Citizens",
    scorefield:  'cvapdens',
    quantilefield: 'cvapdens', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.job_dens = {
    id: 'job_dens',
    title: "Percent of County Workers",
    scorefield:  'job_dens',
    quantilefield: 'job_dens', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.tot_elignonreg_prc = {
    id: 'tot_elignonreg_prc',
    title: "Percent of Eligible Voters Not Registered",
    scorefield:  'tot_elignonreg_prc_final',
    quantilefield: 'tot_elignonreg_prc_final' , quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prcdisabled = {
    id: 'prcdisabled',
    title: "Disabilities Percent of Population",
    scorefield:  'prcdisabled_final',
    quantilefield: 'prcdisabled_final', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_nonengprof = {
    id: 'prc_nonengprof',
    title: "Limited English Proficient Percent of Population",
    scorefield:  'prc_nonengprof_final',
    quantilefield: 'prc_nonengprof_final', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_caraccess_final = {
    id: 'prc_caraccess_final',
    title: "Percent of Population with Vehicle Access",
    scorefield:  'prc_caraccess_final',
    quantilefield: 'prc_caraccess_final', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_pov_final = {
    id: 'prc_pov_final',
    title: "Percent of Population in Poverty",
    scorefield:  'prc_pov_final',
    quantilefield: 'prc_pov_final', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_youth_final = {
    id: 'prc_youth_final',
    title: "Youth Percent of Population",
    scorefield:  'prc_youth_final',
    quantilefield: 'prc_youth_final', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.pollvoter_dens = {
    id: 'pollvoter_dens',
    title: "2020 Percent of County In-Person Voters",
    scorefield:  'pollvoter_dens',
    quantilefield: 'pollvoter_dens', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.popdens = {
    id: 'popdens',
    title: "Population Density (per sq km)",
    scorefield:  'popdens',
    quantilefield: 'popdens', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'integer',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.vbm_tot_2020 = {
    id: 'vbm_tot_2020',
    title: "2020 Vote by Mail Rate (Total)",
    scorefield:  'vbm_tot_2020',
    quantilefield: 'vbm_tot_2020', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.vbm_asn_2020 = {
    id: 'vbm_asn_2020',
    title: "2020 Vote by Mail Rate (Asian-American)",
    scorefield:  'vbm_asn_2020',
    quantilefield: 'vbm_asn_2020', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.vbm_lat_2020 = {
    id: 'vbm_lat_2020',
    title: "2020 Vote by Mail Rate (Latino)",
    scorefield:  'vbm_lat_2020',
    quantilefield: 'vbm_lat_2020', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.vbm_youth_2020 = {
    id: 'vbm_youth_2020',
    title: "2020 Vote by Mail Rate (Youth)",
    scorefield:  'vbm_youth_2020',
    quantilefield: 'vbm_youth_2020', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.vbm_tot_2016 = {
    id: 'vbm_tot_2016',
    title: "2016 Vote by Mail Rate (Total)",
    scorefield:  'vbm_tot_2016',
    quantilefield: 'vbm_tot_2016', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts_2010.json'
};
DATA_LAYERS.vbm_asn_2016 = {
    id: 'vbm_asn_2016',
    title: "2016 Vote by Mail Rate (Asian-American)",
    scorefield:  'vbm_asn_2016',
    quantilefield: 'vbm_asn_2016', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts_2010.json'
};
DATA_LAYERS.vbm_lat_2016 = {
    id: 'vbm_lat_2016',
    title: "2016 Vote by Mail Rate (Latino)",
    scorefield:  'vbm_lat_2016',
    quantilefield: 'vbm_lat_2016', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts_2010.json'
};
DATA_LAYERS.vbm_youth_2016 = {
    id: 'vbm_youth_2016',
    title: "2016 Vote by Mail Rate (Youth)",
    scorefield:  'vbm_youth_2016',
    quantilefield: 'vbm_youth_2016', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts_2010.json'
};
DATA_LAYERS.turnout_tot_2020 = {
    id: 'turnout_tot_2020',
    title: "2020 Registered Voter Turnout Rate (Total)",
    scorefield:  'turnout_tot_2020',
    quantilefield: 'turnout_tot_2020', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.turnout_asn_2020 = {
    id: 'turnout_asn_2020',
    title: "2020 Registered Voter Turnout Rate (Asian-American)",
    scorefield:  'turnout_asn_2020',
    quantilefield: 'turnout_asn_2020', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.turnout_lat_2020 = {
    id: 'turnout_lat_2020',
    title: "2020 Registered Voter Turnout Rate (Latino)",
    scorefield:  'turnout_lat_2020',
    quantilefield: 'turnout_lat_2020', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.turnout_youth_2020 = {
    id: 'turnout_youth_2020',
    title: "2020 Registered Voter Turnout Rate (Youth)",
    scorefield:  'turnout_youth_2020',
    quantilefield: 'turnout_youth_2020', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.turnout_tot_2016 = {
    id: 'turnout_tot_2016',
    title: "2016 Registered Voter Turnout Rate (Total)",
    scorefield:  'turnout_tot_2016',
    quantilefield: 'turnout_tot_2016', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts_2010.json'
};
DATA_LAYERS.turnout_asn_2016 = {
    id: 'turnout_asn_2016',
    title: "2016 Registered Voter Turnout Rate (Asian-American)",
    scorefield:  'turnout_asn_2016',
    quantilefield: 'turnout_asn_2016', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts_2010.json'
};
DATA_LAYERS.turnout_lat_2016 = {
    id: 'turnout_lat_2016',
    title: "2016 Registered Voter Turnout Rate (Latino)",
    scorefield:  'turnout_lat_2016',
    quantilefield: 'turnout_lat_2016', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts_2010.json'
};
DATA_LAYERS.turnout_youth_2016 = {
    id: 'turnout_youth_2016',
    title: "2016 Registered Voter Turnout Rate (Youth)",
    scorefield:  'turnout_youth_2016',
    quantilefield: 'turnout_youth_2016', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts_2010.json'
};
DATA_LAYERS.prc_black = {
    id: 'prc_black',
    title: "Black Percent of Population",
    scorefield: 'prc_black',
    quantilefield: 'prc_black', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_asian = {
    id: 'prc_asian',
    title: "Asian-American Percent of Population",
    scorefield: 'prc_asian',
    quantilefield: 'prc_asian', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_asianindian = {
    id: 'prc_asianindian',
    title: "Asian Indian Percent of Population",
    scorefield: 'prc_asianindian',
    quantilefield: 'prc_asianindian', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_chinese = {
    id: 'prc_chinese',
    title: "Chinese Percent of Population",
    scorefield: 'prc_chinese',
    quantilefield: 'prc_chinese', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_filipino = {
    id: 'prc_filipino',
    title: "Filipino Percent of Population",
    scorefield: 'prc_filipino',
    quantilefield: 'prc_filipino', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_japanese = {
    id: 'prc_japanese',
    title: "Japanese Percent of Population",
    scorefield: 'prc_japanese',
    quantilefield: 'prc_japanese', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_korean = {
    id: 'prc_korean',
    title: "Korean Percent of Population",
    scorefield: 'prc_korean',
    quantilefield: 'prc_korean', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_vietnamese = {
    id: 'prc_vietnamese',
    title: "Vietnamese Percent of Population",
    scorefield: 'prc_vietnamese',
    quantilefield: 'prc_vietnamese', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_latino = {
    id: 'prc_latino',
    title: "Latino Percent of Population",
    scorefield: 'prc_latino',
    quantilefield: 'prc_latino', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_mexican = {
    id: 'prc_mexican',
    title: "Mexican Percent of Population",
    scorefield: 'prc_mexican',
    quantilefield: 'prc_mexican', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_puertorican = {
    id: 'prc_puertorican',
    title: "Puerto Rican Percent of Population",
    scorefield: 'prc_puertorican',
    quantilefield: 'prc_puertorican', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_cuban = {
    id: 'prc_cuban',
    title: "Cuban Percent of Population",
    scorefield: 'prc_cuban',
    quantilefield: 'prc_cuban', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_dominican = {
    id: 'prc_dominican',
    title: "Dominican Percent of Population",
    scorefield: 'prc_dominican',
    quantilefield: 'prc_dominican', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_southam = {
    id: 'prc_southam',
    title: "South American Percent of Population",
    scorefield: 'prc_southam',
    quantilefield: 'prc_southam', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_centralamerican = {
    id: 'prc_centralamerican',
    title: "Central American Percent of Population",
    scorefield: 'prc_centralamerican',
    quantilefield: 'prc_centralamerican', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_white = {
    id: 'prc_white',
    title: "White Percent of Population",
    scorefield: 'prc_white',
    quantilefield: 'prc_white', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_native = {
    id: 'prc_native',
    title: "Native American Percent of Population",
    scoresource: 'indicatordata', scorefield: 'prc_native',
    quantilefield: 'prc_native', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.prc_native_hi = {
    id: 'prc_native_hi',
    title: "Native Hawaiian Percent of Population",
    scoresource: 'indicatordata', scorefield: 'prc_native_hi',
    quantilefield: 'prc_native_hi', quantilecolors: CRITERIA_COLOR_RAMP, // because fillColor == quantile
    legendformat: 'percent',
    radiogroup: 'tractchoropleths',
    layertype: 'indicators',
    tracts: 'tracts.json'
};
DATA_LAYERS.gen2020 = {
    id: 'gen2020',
    title: "2020 General Election Voting Locations",
    csvfile: 'point_files/general_pollingplaces_2020.csv',
    circle: { radius: 20, color: '#B941FF', opacity: 1, fillColor: '#B941FF', fillOpacity: 1, weight: 2, },
    popupnamefield: 'name',
    popuptypetext: '2020 General Voting Location',
    downloadfile: 'point_files/general_pollingplaces_2020.csv',
    downloadtype: 'CSV',
    mapzindex: 'highest',
    layertype: 'pois'
};
DATA_LAYERS.pripoll2020 = {
    id: 'pripoll2020',
    title: "2020 Primary Election Voting Locations",
    csvfile: 'point_files/primary_pollingplaces_2020.csv',
    circle: { radius: 20, color: '#ffa200', opacity: 1, fillColor: '#ffa200', fillOpacity: 1, weight: 2, },
    popupnamefield: 'name',
    popuptypetext: '2020 Primary Voting Location',
    downloadfile: 'point_files/primary_pollingplaces_2020.csv',
    downloadtype: 'CSV',
    mapzindex: 'highest',
    layertype: 'pois'
};
DATA_LAYERS.pricenter2020 = {
    id: 'pricenter2020',
    title: "2020 Primary Election Voting Locations",
    csvfile: 'point_files/primary_votecenters_2020.csv',
    circle: { radius: 20, color: '#ffa200', opacity: 1, fillColor: '#ffa200', fillOpacity: 1, weight: 2,  },
    popupnamefield: 'name',
    popuptypetext: '2020 Primary Election Voting Locations',
    downloadfile: 'point_files/primary_votecenters_2020.csv',
    downloadtype: 'CSV',
    mapzindex: 'highest',
    layertype: 'pois'
};
DATA_LAYERS.transit_stops = {
    id: 'transit_stops',
    title: "Transit Stops",
    csvfile: 'point_files/transit_stops_latlononly.csv',
    circle: { radius: 20, color: '#008817', opacity: 1, fillColor: '#008817', fillOpacity: 1, weight: 2, },
    downloadfile: 'point_files/transit_stops.csv',
    downloadtype: 'CSV',
    mapzindex: 'highest',
    layertype: 'pois'
};
DATA_LAYERS.poi_govish = {
    id: 'poi_govish',
    title: "OpenStreetMap Points of Interest (Government)",
    csvfile: 'point_files/poi_govish.csv',
    circle: { radius: 20, color: '#FF5900', opacity: 1, fillColor: '#FF5900', fillOpacity: 1, weight: 2, },
    popupnamefield: 'name',
    popuptypefield: 'fclass',
    mapzindex: 'highest',
    downloadfile: 'point_files/poi_govish.csv',
    downloadtype: 'CSV',
    layertype: 'pois'
};
DATA_LAYERS.poi_misc = {
    id: 'poi_misc',
    title: "OpenStreetMap Points of Interest (Non-Government)",
    csvfile: 'point_files/poi_misc.csv',
    circle: { radius: 20, color: '#FFDD00', opactiy: 1, fillColor: '#FFDD00', fillOpacity: 1, weight: 2, },
    popupnamefield: 'name',
    popuptypefield: 'fclass',
    mapzindex: 'highest',
    downloadfile: 'point_files/poi_misc.csv',
    downloadtype: 'CSV',
    layertype: 'pois'
};
DATA_LAYERS.poi = {
    id: 'poi',
    title: "OpenStreetMap Points of Interest (All)",
    csvfile: 'point_files/poi.csv',
    circle: { radius: 20, color: '#6A0074', opacity: 1, fillColor: '#6A0074', fillOpacity: 1, weight: 2, },
    popupnamefield: 'name',
    popuptypefield: 'fclass',
    mapzindex: 'highest',
    downloadfile: 'point_files/poi.csv',
    downloadtype: 'CSV',
    layertype: 'pois'
};
DATA_LAYERS.precincts = {
    id: 'precincts',
    title: "2020 General Election Precinct Boundaries",
    customgeojsonfile: 'point_files/precincts.geojson',
    downloadfile: 'point_files/precinctsSHP.zip',
    downloadtype: 'SHP',
    style: { fill: '#969696', fillOpacity: 0, opacity: 5, color: 'black', weight: 1, interactive: true, smoothFactor: 0.5 },
    layertype: 'pois',
};

// and now the data profiles, which are collections of DATA_LAYERS to offer to each county
// full model = all of the layers
// lite = all layers EXCEPT suggested areas
const DATA_PROFILES = {};

// fullmodel
DATA_PROFILES.fullmodel = {
    suggestedareas: [
        DATA_LAYERS.four_day_sites,
        DATA_LAYERS.eleven_day_sites,
        DATA_LAYERS.dropbox_sites,
    ],
    additionalareas: [
        DATA_LAYERS.additional_sites_model, DATA_LAYERS.additional_sites_distance,
    ],
    allareas: [
        DATA_LAYERS.all_sites_scored,
    ],
    voterdata: [
        DATA_LAYERS.cvapdens, 
        DATA_LAYERS.tot_elignonreg_prc,
        DATA_LAYERS.pollvoter_dens,
        DATA_LAYERS.vbm_tot_2016,
        DATA_LAYERS.vbm_tot_2020,
        DATA_LAYERS.turnout_tot_2016, 
        DATA_LAYERS.turnout_tot_2020, 
    ],
    populationdata: [
        DATA_LAYERS.prc_latino, 
        DATA_LAYERS.prc_asian,
        DATA_LAYERS.prc_native_hi, 
        DATA_LAYERS.prc_black,
        DATA_LAYERS.prc_native, 
        DATA_LAYERS.prc_white, 
        DATA_LAYERS.prc_youth_final,
        DATA_LAYERS.prcdisabled, 
        DATA_LAYERS.prc_nonengprof, 
        DATA_LAYERS.job_dens,
        DATA_LAYERS.prc_caraccess_final, 
        DATA_LAYERS.prc_pov_final, 
        DATA_LAYERS.popdens,
    ],
    latino: [
        DATA_LAYERS.prc_mexican,
        DATA_LAYERS.prc_puertorican,
        DATA_LAYERS.prc_cuban,
        DATA_LAYERS.prc_dominican,
        DATA_LAYERS.prc_southam,
        DATA_LAYERS.prc_centralamerican,
    ],
    asian: [
        DATA_LAYERS.prc_asianindian,
        DATA_LAYERS.prc_chinese,
        DATA_LAYERS.prc_filipino,
        DATA_LAYERS.prc_japanese,
        DATA_LAYERS.prc_korean,
        DATA_LAYERS.prc_vietnamese,
    ],
    pointsofinterest: [
        DATA_LAYERS.precincts,
        DATA_LAYERS.gen2020,
        DATA_LAYERS.pripoll2020,
        DATA_LAYERS.pricenter2020,
        DATA_LAYERS.transit_stops,
        DATA_LAYERS.poi_govish, DATA_LAYERS.poi_misc, DATA_LAYERS.poi
    ],
};

DATA_PROFILES.lite = Object.assign({}, DATA_PROFILES.fullmodel);
DATA_PROFILES.lite.suggestedareas = [];
DATA_PROFILES.lite.additionalareas = [];
DATA_PROFILES.lite.allareas = [];
