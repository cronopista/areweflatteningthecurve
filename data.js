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
    "Russia": {
        ventilators: 40000,
        ventilatorsSituation: "<a href='https://meduza.io/en/feature/2020/03/21/the-ventilator-problem' target='_blank'>40,000</a>",
        population: 144500000
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
    "California": {
        ventilators: 15000,
        fixComparition: 15,
        ventilatorsSituation: '15,000 (<a href="https://www.nytimes.com/2020/03/23/us/california-coronavirus-testing-masks.html" target="_blank">guesswork, as the data seems currently unavailable</a>)',
        population: 40000000
    },
    "Minnesota": {
        ventilators: 2818 + 800,
        fixComparition: 18,
        ventilatorsSituation: '<a href="https://mn.gov/covid19/data/response-prep/" target="_blank">2,818 + 800</a>',
        population: 5000000
    },
    "New York": {
        ventilators: 12000,
        fixComparition: 12,
        ventilatorsSituation: '<a href="https://www.nytimes.com/2020/03/17/nyregion/ny-coronavirus-ventilators.html" target="_blank">12,000</a>',
        population: 20000000
    },
    "New Jersey":{
        ventilators: 4500,
        fixComparition: 16,
        ventilatorsSituation: '<a href="https://www.politico.com/states/new-jersey/story/2020/03/26/new-jersey-officials-planning-for-possibility-of-rationing-ventilators-1269246" target="_blank">4,500</a>',
        population: 8800000
    },
    "Oregon": {
        ventilators: 762+400,
        fixComparition: 30,
        ventilatorsSituation: '<a href="https://www.oregonlive.com/coronavirus/2020/04/oregon-sends-140-ventilators-to-new-york-gov-kate-brown-we-are-all-in-this-together.html" target="_blank">762 + 400</a>',
        population: 4218000
    },
    "Wisconsin": {
        ventilators: 1200 + 800,
        fixComparition: 24,
        ventilatorsSituation: '<a href="https://www.wuwm.com/post/coronavirus-ventilators-explained-milwaukee-respiratory-experts#stream/0" target="_blank">1,200</a>',
        population: 5820000
    }

};



