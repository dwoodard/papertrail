import { describe, expect, it } from 'vitest'

import { extractCoordinates, extractKeyword, extractPlaceId, sanitizeValue } from './googleMaps'

describe('extractKeyword', () => {
    it('reads the keyword from a /maps/search/ path', () => {
        const url = 'https://www.google.com/maps/search/rock+landscaping+Davis+County/@40.9,-111.8,12z'
        expect(extractKeyword(url)).toBe('rock landscaping Davis County')
    })

    it('prefers the !1s data parameter when present', () => {
        const url = 'https://www.google.com/maps/place/ABC/data=!4m2!1srock+landscaping!2m1'
        expect(extractKeyword(url)).toBe('rock landscaping')
    })

    it('falls back to the document title', () => {
        expect(extractKeyword('https://www.google.com/maps', 'concrete contractors - Google Maps')).toBe(
            'concrete contractors',
        )
    })

    it('returns undefined when nothing matches', () => {
        expect(extractKeyword('https://www.google.com/maps')).toBeUndefined()
    })
})

describe('extractCoordinates', () => {
    it('parses lat/lng from the @ segment', () => {
        expect(extractCoordinates('https://www.google.com/maps/@40.7608,-111.8910,12z')).toEqual({
            latitude: '40.7608',
            longitude: '-111.8910',
        })
    })

    it('returns an empty object when absent', () => {
        expect(extractCoordinates('https://www.google.com/maps')).toEqual({})
    })
})

describe('extractPlaceId', () => {
    it('parses the 0x… hex place id', () => {
        expect(extractPlaceId('https://www.google.com/maps/place/x/data=!3m1!4b1!4m5!3m4!1s0x875288c5f1b1a3d7'))
            .toBe('0x875288c5f1b1a3d7')
    })

    it('returns undefined without a place id', () => {
        expect(extractPlaceId('https://www.google.com/maps/search/foo')).toBeUndefined()
    })
})

describe('sanitizeValue', () => {
    it('collapses whitespace and trims', () => {
        expect(sanitizeValue('  hello   world \n')).toBe('hello world')
    })

    it('treats empty and N/A as undefined', () => {
        expect(sanitizeValue('')).toBeUndefined()
        expect(sanitizeValue('N/A')).toBeUndefined()
        expect(sanitizeValue(null)).toBeUndefined()
    })
})
