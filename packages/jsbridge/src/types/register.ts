import { ApiKeys } from './apis'

interface BridgeMethod<P, R> {
  params: P
  reponse: R
  entity: P extends undefined ? () => Promise<R> : (args: P) => Promise<R>
}

type BridgeMethodCanIUse = BridgeMethod<
  {
    /** api名称 */
    api: ApiKeys
  },
  {
    /** 0 失败 1 成功 */
    result: '0' | '1'
  }
>

type SafeAreaInfo = Record<'safeAreaTop' | 'safeAreaBottom' | 'safeAreaLeft' | 'safeAreaRight', number>

type BridgeMethodGetSafeArea = BridgeMethod<undefined, SafeAreaInfo>

export interface BridgeRegister {
  canIUse: BridgeMethodCanIUse['entity']
  getSafeArea: BridgeMethodGetSafeArea['entity']
  close: BridgeMethod<undefined, undefined>['entity']
  makePhoneCall: BridgeMethod<{ phoneNumber: string }, undefined>['entity']
}
