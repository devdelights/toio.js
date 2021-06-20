/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EventEmitter } from 'events'
import TypedEmitter from 'typed-emitter'
import { Characteristic } from 'noble'
import { DataType, EulerAngleInfo, QuaternionAngleInfo, SensorSpec } from './specs/sensor-spec'

/**
 * @hidden
 */
export interface Event {
  'sensor:slope': (data: { isSloped: boolean }) => void
  'sensor:collision': (data: { isCollisionDetected: boolean }) => void
  'sensor:double-tap': () => void
  'sensor:orientation': (data: { orientation: number }) => void
  'sensor:attitude-angle-euler': (data: EulerAngleInfo) => void
  'sensor:attitude-angle-quaternion': (data: QuaternionAngleInfo) => void
}

/**
 * @hidden
 */
export class SensorCharacteristic {
  public static readonly UUID = '10b201065b3b45719508cf3efcd7bbae'

  private readonly characteristic: Characteristic

  private readonly eventEmitter: TypedEmitter<Event>

  private readonly spec: SensorSpec = new SensorSpec()

  private prevStatus: {
    isSloped?: boolean
    isCollisionDetected?: boolean
    orientation?: number
  } = {}

  public constructor(characteristic: Characteristic, eventEmitter: EventEmitter) {
    this.characteristic = characteristic
    if (this.characteristic.properties.includes('notify')) {
      this.characteristic.on('data', this.onData.bind(this))
      this.characteristic.subscribe()
    }

    this.eventEmitter = eventEmitter as TypedEmitter<Event>
  }

  public getSlopeStatus(): Promise<{ isSloped: boolean }> {
    return this.read().then(parsedData => {
      const data = parsedData.data as { isSloped: boolean }
      return { isSloped: data.isSloped }
    })
  }

  public getCollisionStatus(): Promise<{ isCollisionDetected: boolean }> {
    return this.read().then(parsedData => {
      const data = parsedData.data as { isCollisionDetected: boolean }
      return { isCollisionDetected: data.isCollisionDetected }
    })
  }

  public getDoubleTapStatus(): Promise<{ isDoubleTapped: boolean }> {
    return this.read().then(parsedData => {
      const data = parsedData.data as { isDoubleTapped: boolean }
      return { isDoubleTapped: data.isDoubleTapped }
    })
  }

  public getOrientation(): Promise<{ orientation: number }> {
    return this.read().then(parsedData => {
      const data = parsedData.data as { orientation: number }
      return { orientation: data.orientation }
    })
  }

  public getAttitudeAngle(): Promise<EulerAngleInfo | QuaternionAngleInfo> {
    return this.read().then(parsedData => {
      return parsedData.data as EulerAngleInfo | QuaternionAngleInfo
    })
  }

  private read(): Promise<DataType> {
    return new Promise((resolve, reject) => {
      this.characteristic.read((error, data) => {
        if (error) {
          reject(error)
        }

        if (!data) {
          reject('cannot read any data from characteristic')
          return
        }

        try {
          const parsedData = this.spec.parse(data)
          resolve(parsedData)
          return
        } catch (e) {
          reject(e)
          return
        }
      })
    })
  }

  private onData(data: Buffer): void {
    try {
      const parsedData = this.spec.parse(data)
      switch (parsedData.dataType) {
        case 'sensor:detection':
          {
            if (this.prevStatus.isSloped !== parsedData.data.isSloped) {
              this.eventEmitter.emit('sensor:slope', { isSloped: parsedData.data.isSloped })
            }
            if (parsedData.data.isCollisionDetected) {
              this.eventEmitter.emit('sensor:collision', { isCollisionDetected: parsedData.data.isCollisionDetected })
            }
            if (parsedData.data.isDoubleTapped) {
              this.eventEmitter.emit('sensor:double-tap')
            }
            if (this.prevStatus.orientation !== parsedData.data.orientation) {
              this.eventEmitter.emit('sensor:orientation', { orientation: parsedData.data.orientation })
            }
            this.prevStatus = parsedData.data
          }
          break
        case 'sensor:attitude-angle-euler':
          this.eventEmitter.emit(parsedData.dataType, parsedData.data)
          break
        case 'sensor:attitude-angle-quaternion':
          this.eventEmitter.emit(parsedData.dataType, parsedData.data)
          break
        default:
          break
      }
    } catch (e) {
      return
    }
  }
}
