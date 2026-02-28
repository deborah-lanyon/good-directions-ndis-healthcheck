#!/usr/bin/env node
const { Client } = require('pg')
const fetch = require('node-fetch')
require('dotenv').config()

const PG_HOST = process.env.DB_HOST || '127.0.0.1'
const PG_PORT = process.env.DB_PORT || '5432'
const PG_USER = process.env.DB_USER || 'postgres'
const PG_PASSWORD = process.env.DB_PASSWORD || ''
const PG_DB = process.env.DB_DATABASE || 'welcomers_dev'
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY || ''

async function geocode(address) {
  if (!address) return null
  if (!GEOCODE_API_KEY) throw new Error('GEOCODE_API_KEY is not set')
  const encoded = encodeURIComponent(address)
  const url = `https://geocode.maps.co/search?q=${encoded}&api_key=${GEOCODE_API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Geocode request failed')
  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) return null
  const r = data[0]
  return { lat: parseFloat(r.lat), lon: parseFloat(r.lon), display_name: r.display_name }
}

async function main() {
  const client = new Client({
    host: PG_HOST,
    port: parseInt(PG_PORT, 10),
    user: PG_USER,
    password: PG_PASSWORD,
    database: PG_DB,
  })

  await client.connect()
  console.log('Connected to DB')

  const res = await client.query(
    'SELECT id, address, address_line1, postcode FROM churches WHERE (latitude IS NULL OR longitude IS NULL) AND (address IS NOT NULL OR address_line1 IS NOT NULL) LIMIT 200'
  )
  console.log(`Found ${res.rows.length} churches to backfill`)

  for (const row of res.rows) {
    try {
      const address = row.address || row.address_line1
      if (!address) continue
      const geo = await geocode(address)
      if (!geo) {
        console.log(`No geocode result for church id=${row.id}`)
        continue
      }
      const { lat, lon } = geo
      await client.query('UPDATE churches SET latitude=$1, longitude=$2 WHERE id=$3', [
        lat,
        lon,
        row.id,
      ])
      console.log(`Updated church ${row.id} -> ${lat},${lon}`)
    } catch (err) {
      console.error('Error backfilling row', row.id, err.message)
    }
  }

  await client.end()
  console.log('Backfill complete')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
