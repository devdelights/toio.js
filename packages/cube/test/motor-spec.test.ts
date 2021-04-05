/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MotorSpec } from '../src/characteristics/specs/motor-spec'

describe('motor spec', () => {
  const spec = new MotorSpec()

  test('build buffer to write move operation', () => {
    const inputLeft = 100
    const inputRight = -20
    const data = spec.move(inputLeft, inputRight)

    expect(data.buffer).toEqual(Buffer.from([0x02, 0x01, 0x01, 0x64, 0x02, 0x02, 0x14, 0x00]))
    expect(data.data).toEqual({
      left: inputLeft,
      right: inputRight,
      durationMs: 0,
    })
  })

  test('build buffer to write move operation with duration', () => {
    const inputLeft = 100
    const inputRight = -20
    const inputDuration = 100
    const data = spec.move(inputLeft, inputRight, inputDuration)

    expect(data.buffer).toEqual(Buffer.from([0x02, 0x01, 0x01, 0x64, 0x02, 0x02, 0x14, 0x0a]))
    expect(data.data).toEqual({
      left: inputLeft,
      right: inputRight,
      durationMs: inputDuration,
    })
  })

  test('build buffer to write move operation with out of range parameter', () => {
    const inputLeft = -500
    const inputRight = 500
    const inputDuration = 3000
    const data = spec.move(inputLeft, inputRight, inputDuration)

    expect(data.buffer).toEqual(Buffer.from([0x02, 0x01, 0x02, 0x73, 0x02, 0x01, 0x73, 0xff]))
    expect(data.data).toEqual({
      left: -115,
      right: 115,
      durationMs: 2550,
    })
  })

  test('build buffer to write move operation with accelaration', () => {
    const transSpeed = 50
    const transAcceleration = 5
    const rotateSpeed = 0x000f
    const priorityType = 0 // prioritize translation
    const durationMs = 1000
    const data = spec.moveByAccelaration(transSpeed, transAcceleration, rotateSpeed, priorityType, durationMs)

    expect(data.buffer).toEqual(Buffer.from([0x05, 0x32, 0x05, 0x0f, 0x00, 0x00, 0x00, 0x00, 0x64]))
    expect(data.data).toEqual({
      transSpeed: 50,
      transAcceleration: 5,
      rotateSpeed: 15,
      priorityType: 0,
      durationMs: 1000,
    })
  })

  test('build buffer to write move operation with out of range accelaration', () => {
    const transSpeed = -5000
    const transAcceleration = 500
    const rotateSpeed = -0xffff
    const priorityType = 1 // prioritize rotation
    const data = spec.moveByAccelaration(transSpeed, transAcceleration, rotateSpeed, priorityType)

    expect(data.buffer).toEqual(Buffer.from([0x05, 0x73, 0xff, 0xff, 0xff, 0x01, 0x01, 0x01, 0x00]))
    expect(data.data).toEqual({
      transSpeed: -MotorSpec.MAX_SPEED,
      transAcceleration: 255,
      rotateSpeed: -0xffff,
      priorityType: 1,
      durationMs: 0,
    })
  })
})
