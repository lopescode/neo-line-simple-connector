import { NeonInvoker } from '@cityofzion/neon-invoker'
import { wallet } from '@cityofzion/neon-js'
import BigNumber from 'bignumber.js'

export class GleederHelper {
  static neonInvoker: NeonInvoker | null = null
  static rpcUrl = 'https://n3seed2.ngd.network:10332'
  static neoScriptHash = '0xef4073a0f2b305a38ec4050e4d3d28bc40ea63f5'
  static gasScriptHash = '0xd2a4cff31913016155e38e474a2c06d08be276cf'
  static neoProxyScriptHash = '0xd29f20a634b4d8f31b14824eeba69ff0acdafe6d'
  static flamingoSwapRouterScriptHash = '0xf970f4ccecd765b63732b821775dc38c25d74f23'
  static bneoScriptHash = '0x48c40d4666f93408be1bef038b6722404d9a4c2a'

  static async getNeonInvoker(): Promise<NeonInvoker> {
    if (!this.neonInvoker) {
      this.neonInvoker = await NeonInvoker.init({
        rpcAddress: this.rpcUrl,
      })
    }

    return this.neonInvoker
  }

  static async getAmountsOut(amountIn: string) {
    const amountInBn = BigNumber(amountIn).shiftedBy(8).toString()

    const neonInvoker = await this.getNeonInvoker()

    const response = await neonInvoker.testInvoke({
      invocations: [
        {
          operation: 'getAmountsOut',
          scriptHash: this.flamingoSwapRouterScriptHash,
          args: [
            { type: 'Integer', value: amountInBn },
            {
              type: 'Array',
              value: [
                {
                  type: 'Hash160',
                  value: this.bneoScriptHash,
                },
                {
                  type: 'Hash160',
                  value: this.gasScriptHash,
                },
              ],
            },
          ],
        },
      ],
    })

    const gasOut = response.stack[0].value as any[]

    const fixedFee = 50000000

    return {
      amountOutMin: (gasOut[1].value - fixedFee).toString(),
    }
  }

  static async swapNeo(neoline: any, address: string, amountIn: string, amountOutMin: string) {
    try {
      const result = await neoline.invoke({
        scriptHash: this.neoProxyScriptHash,
        operation: 'swapNeo',
        args: [
            {
                type: 'Address',
                value: address,
            },
            {
                type: "Integer",
                value: amountIn,
            },
            {
                type: "Integer",
                value: amountOutMin,
            }
        ],
        fee: '0',
        broadcastOverride: false,
        signers: [
            {
                account: this.neoProxyScriptHash,
                scopes: 128
            },
            {
                account: `0x${new wallet.Account(address).scriptHash}`,
                scopes: 128
            }
        ]
      })

      console.log({result})

      return result.txid
    } catch (error) {
      console.error(error)
      return '-1'
    }
  }
}