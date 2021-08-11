const axios = require('axios')
const createCsvWriter = require('csv-writer').createArrayCsvWriter;

const PAGELIMIT = 600
const APIKEY = 'shoulder-vtexio'
const URL = `https://busca.chaordic.com.br/search/api/hotsite?page=1&sort=lastModDate_desc&isAutomatic=false&limit=${PAGELIMIT}`
const SID = 's%3Azu8-wDjEkyIRvQpz-W--cl9wzP-QR6P2.kHZJSTw5wEI%2Bh3CaL5r7x4LEiFIObT4dwcdAaVBkBQ8'


async function buildUngroupedId (ids) {
  const newIds = Promise.all(ids.map(async id => {
    const platformProduct = await fetchPlatformProduct(id)

    return [`${id}-${platformProduct.skus[0].specs.Cor}`, id]
  }))

  return newIds
}

async function fetchPlatformProduct (productId) {
  try {
    const { PLAT_USER, PLAT_PASSWORD } = process.env
    const json = await axios.get(`https://${PLAT_USER}:${PLAT_PASSWORD}@platform.chaordicsystems.com/raas/v2/clients/${APIKEY}/products/${productId}`)

    console.log('Fetching product ', productId)

    return json.data
  } catch (error) {
    console.log('Failed to fetch platform product', error)
  }
}

async function getHotSiteProductIds () {
  try {
    const json = await fetchHotsite()
    const productIds = await json.docs.map(res => res.productIds).flat()
  
    return productIds
      
  } catch (error) {
    console.log('Failed to get hotsite product ids', error)
  }
}

async function fetchHotsite () {
  try {
    const payload = await axios.get(URL, {
      headers: {
        Cookie: `sid=${SID}`
      }
    })
    const json = await payload.data
  
    return json

  } catch (error) {
    console.log('Failed to fetch hotsites api', error)
  }
}

getHotSiteProductIds().then(async res => {
  const newIds = await buildUngroupedId(res)

  createWorkBook(newIds)
})

async function createWorkBook (ids) {
  const records = ids.map(id => [id])
  
  const csvWriter = createCsvWriter({
    header: ['<ID_Novo>','<ID_Antigo>'],
    path: './csv/file.csv'
  });

  csvWriter.writeRecords(records).then(() => {
    console.log('done')
  })
}

console.log('test')