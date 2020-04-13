var regionData = {
    "Belgium": {
        ventilators: 5000,
        ventilatorsSituation: '5,000 (ballpark estimation, could not find figures)',
        population: 11460000
    },
    "Brazil": {
        ventilators: 65411,
        ventilatorsSituation: "<a href='https://saude.estadao.com.br/noticias/geral,governo-busca-opcoes-para-ampliar-leitos-e-respiradores-no-sus-e-fugir-do-cenario-italiano,70003238174'>65,411</a>",
        population: 210000000
    },
    "Canada": {
        ventilators: 35000,
        ventilatorsSituation: "<a href='https://nationalpost.com/news/canadian-firms-will-produce-30000-new-ventilators-as-officials-prepare-for-worst-case-covid-19-scenario'>35,000</a>",
        population: 37590000
    },
    "France": {
        ventilators: 14000,
        ventilatorsSituation: "<a href='https://www.ft.com/content/42f636be-751d-4ebf-9b55-bf313014769f' target='_blank'>14,000</a>",
        population: 66990000
    },
    "Germany": {
        ventilators: 25000,
        ventilatorsSituation: "<a href='https://www.nytimes.com/2020/03/17/opinion/coronavirus-europe-germany.html' target='_blank'>25,000</a>",
        population: 83000000
    },
    "India": {
        ventilators: 8432,
        ventilatorsSituation: "<a href='https://www.thehindubusinessline.com/news/national/from-best-to-worst-scenario-india-will-need-thousands-of-ventilators-upgraded-health-infra-to-tackle-virus-icmr/article31156295.ece' target='_blank'>8,432</a>",
        population: 1330000000
    },
    "Iran": {
        ventilators: 7200,
        ventilatorsSituation: '<a href="https://www.foreignaffairs.com/articles/iran/2020-04-02/sanctions-make-coronavirus-more-deadly" target="_blank">7,200</a>',
        population: 81100000
    },

    "Italy": {
        ventilators: 13000,
        ventilatorsSituation: "<a href='https://www.reuters.com/article/us-health-coronavirus-ventilators-insigh/army-joins-the-production-line-as-ventilator-makers-scramble-to-meet-demand-idUSKBN2180JU' target='_blank'>12,000 (guesswork as the real number is hard to find)</a>",
        population: 60500000
    },
    
    "Netherlands": {
        ventilators: 2000,
        ventilatorsSituation: "<a href='https://nltimes.nl/2020/03/24/philips-steps-ventilator-production-covid-19-fight-us-block-distribution-nl' target='_blank'>2,000</a>",
        population: 17280000
    },
    "Portugal": {
        ventilators: 1142 + 1142,
        ventilatorsSituation: "<a href='https://youtu.be/Bb4mOb_YsCs?t=1225' target='_blank'>1142×2</a>",
        population: 10276617
    },

    "Spain": {
        ventilators: 12000,
        ventilatorsSituation: "<a href='https://www.elespanol.com/ciencia/salud/20200325/escandalo-respiradores-espana-distribuirlos-no-sabe/477202839_0.html' target='_blank'>12,000 (pure guesswork as the real number is currently unknown)</a>",
        population: 46000000

    },
    "Switzerland": {
        ventilators: 750,
        ventilatorsSituation: "<a href='https://lenews.ch/2020/03/14/coronavirus-swiss-hospitals-have-around-750-breathing-ventilators/' target='_blank'>750</a>",
        population: 8570000

    },
    
    "Turkey": {
        ventilators: 17000,
        ventilatorsSituation: '<a href="https://healthmanagement.org/c/icu/issuearticle/state-of-intensive-care-in-turkey" target="_blank">17,000 (ballpark estimation)</a>',
        population: 82000000
    },

    "United Kingdom": {
        ventilators: 8000,
        ventilatorsSituation: '<a href="https://www.theguardian.com/world/2020/mar/30/uk-government-orders-more-ventilators-for-coronavirus-crisis" target="_blank">8,000</a>',
        population: 66440000
    },

    "US": {
        ventilators: 170000,
        ventilatorsSituation: '<a href="https://www.nytimes.com/2020/03/12/upshot/coronavirus-biggest-worry-hospital-capacity.html" target="_blank">170,000</a>',
        population: 327200000
    },

    "New York": {
        startDate: new Date(2020, 2, 2),
        ventilators: 12000,
        fixComparition: 14,
        ventilatorsSituation: '<a href="https://www.nytimes.com/2020/03/17/nyregion/ny-coronavirus-ventilators.html" target="_blank">12,000</a>',
        population: 20000000,
        totalsInitial: [
            1,
            2,
            11,
            23,
            31,
            76,
            106,
            142,
            173,
            220,
            328,
            421,
            525,
            732,
            967,
            1706,
            2495,
            5365,
            8310,
            11710,
            15793,
            20884,
            25681,
            37258,
            44635,
            52318,
            59513,
            66526,
            75813,
            83887,
            92381,
            102863,
            113706,
            122596,
            131239,
            138836,
            149401,
            159937,
            170512,
            180458
        ]
    },
    "California": {
        startDate: new Date(2020, 2, 2),
        ventilators: 15000,
        fixComparition: 17,
        ventilatorsSituation: '15,000 (<a href="https://www.nytimes.com/2020/03/23/us/california-coronavirus-testing-masks.html" target="_blank">guesswork, as the data seems currently unavailable</a>)',
        population: 40000000,
        totalsInitial: [
            21,
            25,
            35,
            51,
            59,
            81,
            95,
            101,
            144,
            177,
            221,
            282,
            340,
            426,
            557,
            698,
            751,
            952,
            1177,
            1364,
            1642,
            2108,
            2538,
            3183,
            4450,
            4914,
            5735,
            6346,
            7566,
            8794,
            9816,
            11277,
            12573,
            13894,
            15221,
            16329,
            18333,
            19043,
            21324,
            22421
        ]
    },
    "Minnesota": {
        startDate: new Date(2020, 2, 6),
        ventilators: 2444 + 800,
        fixComparition: 12,
        ventilatorsSituation: '<a href="https://mn.gov/covid19/data/response.jsp" target="_blank">2,444 + 800</a>',
        population: 5000000,
        totalsInitial: [
            1,
            2,
            2,
            2,
            3,
            5,
            9,
            14,
            21,
            35,
            54,
            60,
            77,
            89,
            115,
            137,
            169,
            235,
            261,
            287,
            346,
            398,
            441,
            504,
            576,
            629,
            689,
            742,
            789,
            865,
            935,
            986,
            1069,
            1154,
            1242,
            1335,
            1427
        ]
    }

};



