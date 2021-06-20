/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * @hidden
 */
export type DataType =
  | {
      buffer: Uint8Array
      data: {
        isSloped: boolean
        isCollisionDetected: boolean
        isDoubleTapped: boolean
        orientation: number
      }
      dataType: 'sensor:detection'
    }
  | {
      buffer: Uint8Array
      data: EulerAngleInfo
      dataType: 'sensor:attitude-angle-euler'
    }
  | {
      buffer: Uint8Array
      data: QuaternionAngleInfo
      dataType: 'sensor:attitude-angle-quaternion'
    }

export interface EulerAngleInfo {
  roll: number
  pitch: number
  yaw: number
}

export interface QuaternionAngleInfo {
  w: number
  x: number
  y: number
  z: number
}

/**
 * @hidden
 */
export class SensorSpec {
  public parse(buffer: Buffer): DataType {
    if (buffer.byteLength < 3) {
      throw new Error('parse error')
    }
    const type = buffer.readUInt8(0)

    switch (type) {
      case 0x01:
        {
          const isSloped = buffer.readUInt8(1) === 0
          const isCollisionDetected = buffer.readUInt8(2) === 1
          const isDoubleTapped = buffer.readUInt8(3) === 1
          const orientation = buffer.readUInt8(4)
          return {
            buffer: buffer,
            data: {
              isSloped: isSloped,
              isCollisionDetected: isCollisionDetected,
              isDoubleTapped: isDoubleTapped,
              orientation: orientation,
            },
            dataType: 'sensor:detection',
          }
        }
        break
      case 0x03: {
        const rotationType = buffer.readUInt8(1)
        if (rotationType === 1) {
          return {
            buffer: buffer,
            data: {
              roll: buffer.readInt16LE(2),
              pitch: buffer.readInt16LE(4),
              yaw: buffer.readInt16LE(6),
            },
            dataType: 'sensor:attitude-angle-euler',
          }
        } else {
          return {
            buffer: buffer,
            data: {
              w: buffer.readInt16LE(2),
              x: buffer.readInt16LE(4),
              y: buffer.readInt16LE(6),
              z: buffer.readInt16LE(8),
            },
            dataType: 'sensor:attitude-angle-quaternion',
          }
        }
      }
      default:
        break
    }
    // error
    throw new Error('parse error')
  }
}
