/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SensorSpec } from '../src/characteristics/specs/sensor-spec'

describe('sensor spec', () => {
  const spec = new SensorSpec()

  test('parse sensor event correctly', () => {
    const input = Buffer.from([0x01, 0x00, 0x00, 0x00, 0x00])
    const output = spec.parse(input)

    expect(output.buffer).toEqual(input)
    expect(output.dataType).toEqual('sensor:detection')
    expect(output.data).toEqual({
      isSloped: true,
      isCollisionDetected: false,
      isDoubleTapped: false,
      orientation: 0,
    })
  })

  test('parse attitude angle by euler correctly', () => {
    const input = Buffer.from([0x03, 0x01, 0xb4, 0x00, 0x00, 0x00, 0x4e, 0xff])
    const output = spec.parse(input)

    expect(output.buffer).toEqual(input)
    expect(output.dataType).toEqual('sensor:attitude-angle-euler')
    expect(output.data).toEqual({
      roll: 180,
      pitch: 0,
      yaw: -178,
    })
  })

  test('parse attitude angle by quaternion correctly', () => {
    const input = Buffer.from([0x03, 0x02, 0x00, 0x00, 0x10, 0x27, 0x00, 0x00, 0x00, 0x00])
    const output = spec.parse(input)

    expect(output.buffer).toEqual(input)
    expect(output.dataType).toEqual('sensor:attitude-angle-quaternion')
    expect(output.data).toEqual({
      w: 0,
      x: 10000,
      y: 0,
      z: 0,
    })
  })
})
