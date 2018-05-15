const Long = require('long')

const Encoder = require('./encoder')
const Decoder = require('./decoder')

const MAX_SAFE_POSITIVE_SIGNED_INT = 2147483647
const MIN_SAFE_NEGATIVE_SIGNED_INT = -2147483648

describe('Protocol > Encoder', () => {
  const signed32 = number => new Encoder().writeSignedVarInt32(number).buffer
  const decode32 = buffer => new Decoder(buffer).readSignedVarInt32()

  const signed64 = number => new Encoder().writeSignedVarInt64(number).buffer
  const decode64 = buffer => new Decoder(buffer).readSignedVarInt64()

  describe('varint', () => {
    test('encode signed int32 numbers', () => {
      expect(signed32(0)).toEqual(Buffer.from([0x00]))
      expect(signed32(1)).toEqual(Buffer.from([0x02]))
      expect(signed32(63)).toEqual(Buffer.from([0x7e]))
      expect(signed32(64)).toEqual(Buffer.from([0x80, 0x01]))
      expect(signed32(8191)).toEqual(Buffer.from([0xfe, 0x7f]))
      expect(signed32(8192)).toEqual(Buffer.from([0x80, 0x80, 0x01]))
      expect(signed32(1048575)).toEqual(Buffer.from([0xfe, 0xff, 0x7f]))
      expect(signed32(1048576)).toEqual(Buffer.from([0x80, 0x80, 0x80, 0x01]))
      expect(signed32(134217727)).toEqual(Buffer.from([0xfe, 0xff, 0xff, 0x7f]))
      expect(signed32(134217728)).toEqual(Buffer.from([0x80, 0x80, 0x80, 0x80, 0x01]))

      expect(signed32(-1)).toEqual(Buffer.from([0x01]))
      expect(signed32(-64)).toEqual(Buffer.from([0x7f]))
      expect(signed32(-65)).toEqual(Buffer.from([0x81, 0x01]))
      expect(signed32(-8192)).toEqual(Buffer.from([0xff, 0x7f]))
      expect(signed32(-8193)).toEqual(Buffer.from([0x81, 0x80, 0x01]))
      expect(signed32(-1048576)).toEqual(Buffer.from([0xff, 0xff, 0x7f]))
      expect(signed32(-1048577)).toEqual(Buffer.from([0x81, 0x80, 0x80, 0x01]))
      expect(signed32(-134217728)).toEqual(Buffer.from([0xff, 0xff, 0xff, 0x7f]))
      expect(signed32(-134217729)).toEqual(Buffer.from([0x81, 0x80, 0x80, 0x80, 0x01]))
    })

    test('encode signed int32 boundaries', () => {
      expect(signed32(MAX_SAFE_POSITIVE_SIGNED_INT)).toEqual(
        Buffer.from([0xfe, 0xff, 0xff, 0xff, 0x0f])
      )
      expect(signed32(MIN_SAFE_NEGATIVE_SIGNED_INT)).toEqual(
        Buffer.from([0xff, 0xff, 0xff, 0xff, 0x0f])
      )
    })

    test('decode int32 numbers', () => {
      expect(decode32(signed32(0))).toEqual(0)
      expect(decode32(signed32(1))).toEqual(1)
      expect(decode32(signed32(63))).toEqual(63)
      expect(decode32(signed32(64))).toEqual(64)
      expect(decode32(signed32(8191))).toEqual(8191)
      expect(decode32(signed32(8192))).toEqual(8192)
      expect(decode32(signed32(1048575))).toEqual(1048575)
      expect(decode32(signed32(1048576))).toEqual(1048576)
      expect(decode32(signed32(134217727))).toEqual(134217727)
      expect(decode32(signed32(134217728))).toEqual(134217728)

      expect(decode32(signed32(-1))).toEqual(-1)
      expect(decode32(signed32(-64))).toEqual(-64)
      expect(decode32(signed32(-65))).toEqual(-65)
      expect(decode32(signed32(-8192))).toEqual(-8192)
      expect(decode32(signed32(-8193))).toEqual(-8193)
      expect(decode32(signed32(-1048576))).toEqual(-1048576)
      expect(decode32(signed32(-1048577))).toEqual(-1048577)
      expect(decode32(signed32(-134217728))).toEqual(-134217728)
      expect(decode32(signed32(-134217729))).toEqual(-134217729)
    })

    test('decode signed int32 boundaries', () => {
      expect(decode32(signed32(MAX_SAFE_POSITIVE_SIGNED_INT))).toEqual(MAX_SAFE_POSITIVE_SIGNED_INT)
      expect(decode32(signed32(MIN_SAFE_NEGATIVE_SIGNED_INT))).toEqual(MIN_SAFE_NEGATIVE_SIGNED_INT)
    })
  })

  describe('varlong', () => {
    test('encode signed int64 number', () => {
      expect(signed64(0)).toEqual(Buffer.from([0x00]))
      expect(signed64(1)).toEqual(Buffer.from([0x02]))
      expect(signed64(63)).toEqual(Buffer.from([0x7e]))
      expect(signed64(64)).toEqual(Buffer.from([0x80, 0x01]))
      expect(signed64(8191)).toEqual(Buffer.from([0xfe, 0x7f]))
      expect(signed64(8192)).toEqual(Buffer.from([0x80, 0x80, 0x01]))
      expect(signed64(1048575)).toEqual(Buffer.from([0xfe, 0xff, 0x7f]))
      expect(signed64(1048576)).toEqual(Buffer.from([0x80, 0x80, 0x80, 0x01]))
      expect(signed64(134217727)).toEqual(Buffer.from([0xfe, 0xff, 0xff, 0x7f]))
      expect(signed64(134217728)).toEqual(Buffer.from([0x80, 0x80, 0x80, 0x80, 0x01]))
      expect(signed64(MAX_SAFE_POSITIVE_SIGNED_INT)).toEqual(
        Buffer.from([0xfe, 0xff, 0xff, 0xff, 0x0f])
      )
      expect(signed64(Long.fromString('17179869183'))).toEqual(
        Buffer.from([0xfe, 0xff, 0xff, 0xff, 0x7f])
      )
      expect(signed64(Long.fromString('17179869184'))).toEqual(
        Buffer.from([0x80, 0x80, 0x80, 0x80, 0x80, 0x01])
      )
      expect(signed64(Long.fromString('2199023255551'))).toEqual(
        Buffer.from([0xfe, 0xff, 0xff, 0xff, 0xff, 0x7f])
      )
      expect(signed64(Long.fromString('2199023255552'))).toEqual(
        Buffer.from([0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x01])
      )
      expect(signed64(Long.fromString('281474976710655'))).toEqual(
        Buffer.from([0xfe, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f])
      )
      expect(signed64(Long.fromString('281474976710656'))).toEqual(
        Buffer.from([0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x01])
      )
      expect(signed64(Long.fromString('36028797018963967'))).toEqual(
        Buffer.from([0xfe, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f])
      )
      expect(signed64(Long.fromString('36028797018963968'))).toEqual(
        Buffer.from([0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x01])
      )
      expect(signed64(Long.fromString('4611686018427387903'))).toEqual(
        Buffer.from([0xfe, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f])
      )
      expect(signed64(Long.fromString('4611686018427387904'))).toEqual(
        Buffer.from([0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x01])
      )
      expect(signed64(Long.MAX_VALUE)).toEqual(
        Buffer.from([0xfe, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01])
      )

      expect(signed64(-1)).toEqual(Buffer.from([0x01]))
      expect(signed64(-64)).toEqual(Buffer.from([0x7f]))
      expect(signed64(-65)).toEqual(Buffer.from([0x81, 0x01]))
      expect(signed64(-8192)).toEqual(Buffer.from([0xff, 0x7f]))
      expect(signed64(-8193)).toEqual(Buffer.from([0x81, 0x80, 0x01]))
      expect(signed64(-1048576)).toEqual(Buffer.from([0xff, 0xff, 0x7f]))
      expect(signed64(-1048577)).toEqual(Buffer.from([0x81, 0x80, 0x80, 0x01]))
      expect(signed64(-134217728)).toEqual(Buffer.from([0xff, 0xff, 0xff, 0x7f]))
      expect(signed64(-134217729)).toEqual(Buffer.from([0x81, 0x80, 0x80, 0x80, 0x01]))
      expect(signed64(MIN_SAFE_NEGATIVE_SIGNED_INT)).toEqual(
        Buffer.from([0xff, 0xff, 0xff, 0xff, 0x0f])
      )
      expect(signed64(Long.fromString('-17179869184'))).toEqual(
        Buffer.from([0xff, 0xff, 0xff, 0xff, 0x7f])
      )
      expect(signed64(Long.fromString('-17179869185'))).toEqual(
        Buffer.from([0x81, 0x80, 0x80, 0x80, 0x80, 0x01])
      )
      expect(signed64(Long.fromString('-2199023255552'))).toEqual(
        Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0x7f])
      )
      expect(signed64(Long.fromString('-2199023255553'))).toEqual(
        Buffer.from([0x81, 0x80, 0x80, 0x80, 0x80, 0x80, 0x01])
      )
      expect(signed64(Long.fromString('-281474976710656'))).toEqual(
        Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f])
      )
      expect(signed64(Long.fromString('-281474976710657'))).toEqual(
        Buffer.from([0x81, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 1])
      )
      expect(signed64(Long.fromString('-36028797018963968'))).toEqual(
        Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f])
      )
      expect(signed64(Long.fromString('-36028797018963969'))).toEqual(
        Buffer.from([0x81, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x01])
      )
      expect(signed64(Long.fromString('-4611686018427387904'))).toEqual(
        Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f])
      )
      expect(signed64(Long.fromString('-4611686018427387905'))).toEqual(
        Buffer.from([0x81, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x01])
      )
      expect(signed64(Long.MIN_VALUE)).toEqual(
        Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01])
      )
    })

    test('decode signed int64 number', () => {
      expect(decode64(signed64(0))).toEqual(Long.fromInt(0))
      expect(decode64(signed64(1))).toEqual(Long.fromInt(1))
      expect(decode64(signed64(63))).toEqual(Long.fromInt(63))
      expect(decode64(signed64(64))).toEqual(Long.fromInt(64))
      expect(decode64(signed64(8191))).toEqual(Long.fromInt(8191))
      expect(decode64(signed64(8192))).toEqual(Long.fromInt(8192))
      expect(decode64(signed64(1048575))).toEqual(Long.fromInt(1048575))
      expect(decode64(signed64(1048576))).toEqual(Long.fromInt(1048576))
      expect(decode64(signed64(134217727))).toEqual(Long.fromInt(134217727))
      expect(decode64(signed64(134217728))).toEqual(Long.fromInt(134217728))
      expect(decode64(signed64(MAX_SAFE_POSITIVE_SIGNED_INT))).toEqual(
        Long.fromInt(MAX_SAFE_POSITIVE_SIGNED_INT)
      )
      expect(decode64(signed64(Long.fromString('17179869183')))).toEqual(
        Long.fromString('17179869183')
      )
      expect(decode64(signed64(Long.fromString('17179869184')))).toEqual(
        Long.fromString('17179869184')
      )
      expect(decode64(signed64(Long.fromString('2199023255551')))).toEqual(
        Long.fromString('2199023255551')
      )
      expect(decode64(signed64(Long.fromString('2199023255552')))).toEqual(
        Long.fromString('2199023255552')
      )
      expect(decode64(signed64(Long.fromString('281474976710655')))).toEqual(
        Long.fromString('281474976710655')
      )
      expect(decode64(signed64(Long.fromString('281474976710656')))).toEqual(
        Long.fromString('281474976710656')
      )
      expect(decode64(signed64(Long.fromString('36028797018963967')))).toEqual(
        Long.fromString('36028797018963967')
      )
      expect(decode64(signed64(Long.fromString('36028797018963968')))).toEqual(
        Long.fromString('36028797018963968')
      )
      expect(decode64(signed64(Long.fromString('4611686018427387903')))).toEqual(
        Long.fromString('4611686018427387903')
      )
      expect(decode64(signed64(Long.fromString('4611686018427387904')))).toEqual(
        Long.fromString('4611686018427387904')
      )
      expect(decode64(signed64(Long.MAX_VALUE))).toEqual(Long.MAX_VALUE)
    })
  })
})
