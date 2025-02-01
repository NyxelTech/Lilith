/**
 * Lilith - A WhatsApp Bot
 * Copyright (c) 2024 Vesper
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 * 
 * Credits:
 * - Baileys Library by @adiwajshing
 * - Pair Code implementation inspired by TechGod143 & DGXEON
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod }
}
Object.defineProperty(exports, "__esModule", { value: true })

const axios = require("axios")
const cheerio = require("cheerio")
const { resolve } = require("path")
const util = require("util")
let BodyForm = require('form-data')
let { fromBuffer } = require('file-type')
let fs = require('fs')
const fsPromises = require('fs').promises;
const child_process = require('child_process')
const ffmpeg = require('fluent-ffmpeg')

const { unlink } = require('fs').promises

exports.sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.fetchJson = async (url, options = {}) => {
    try {
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        })
        return res.data
    } catch (err) {
        return err
    }
}

exports.fetchBuffer = async (url, options = {}) => {
    try {
        const res = await axios({
            method: "GET",
            url,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36",
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            ...options,
            responseType: 'arraybuffer'
        })
        return res.data
    } catch (err) {
        return err
    }
}

exports.webp2mp4File = async (path) => {
    return new Promise((resolve, reject) => {
        const form = new BodyForm()
        form.append('new-image-url', '')
        form.append('new-image', fs.createReadStream(path))

        axios({
            method: 'post',
            url: 'https://s6.ezgif.com/webp-to-mp4',
            data: form,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${form._boundary}`
            }
        }).then(({ data }) => {
            const bodyFormThen = new BodyForm()
            const $ = cheerio.load(data)
            const file = $('input[name="file"]').attr('value')
            bodyFormThen.append('file', file)
            bodyFormThen.append('convert', "Convert WebP to MP4!")

            axios({
                method: 'post',
                url: 'https://ezgif.com/webp-to-mp4/' + file,
                data: bodyFormThen,
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${bodyFormThen._boundary}`
                }
            }).then(({ data }) => {
                const $ = cheerio.load(data)
                const result = 'https:' + $('div#output > p.outfile > video > source').attr('src')
                resolve({
                    status: true,
                    message: "Created By Eternity",
                    result: result
                })
            }).catch(reject)
        }).catch(reject)
    })
}

exports.WAVersion = async () => {
    let get = await exports.fetchJson("https://web.whatsapp.com/check-update?version=1&platform=web")
    return [get.currentVersion.replace(/[.]/g, ", ")]
}

exports.getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`
}

exports.isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'gi'))
}

exports.isNumber = (number) => {
    const int = parseInt(number)
    return typeof int === 'number' && !isNaN(int)
}

exports.TelegraPh = async (Path) => {
    if (!fs.existsSync(Path)) throw new Error("File not Found")

    try {
        const form = new BodyForm();
        form.append("file", fs.createReadStream(Path))
        const { data } = await axios({
            url: "https://telegra.ph/upload",
            method: "POST",
            headers: {
                ...form.getHeaders()
            },
            data: form
        })
        return "https://telegra.ph" + data[0].src
    } catch (err) {
        throw new Error(String(err))
    }
}

exports.buffergif = async (image) => {
    const filename = `${Math.random().toString(36)}`

    // Write the GIF file
    await fsPromises.writeFile(`./XeonMedia/trash/${filename}.gif`, image)

    // Convert GIF to MP4
    child_process.exec(
        `ffmpeg -i ./XeonMedia/trash/${filename}.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ./XeonMedia/trash/${filename}.mp4`
    )

    // Wait for conversion
    await exports.sleep(4000)

    // Read the MP4 file
    let buffer5 = await fsPromises.readFile(`./XeonMedia/trash/${filename}.mp4`)

    // Delete temp files
    await cleanupFiles(filename)

    return buffer5
}

// Function to cleanup files asynchronously
async function cleanupFiles(filename) {
    try {
        await Promise.all([
            unlink(`./XeonMedia/video/${filename}.mp4`).catch(() => {}),
            unlink(`./XeonMedia/gif/${filename}.gif`).catch(() => {})
        ])
        console.log("Temporary files deleted successfully.")
    } catch (error) {
        console.error("Error deleting files:", error)
    }
}
