import ganache, { Server } from "ganache";
import * as dotenv from "dotenv";
import { contextParamsLocalChain } from "./constants";
import { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";

dotenv.config({ path: "env/.env" });

export class GanacheServer {
    public static instance: Server;
    public static initialAccounts: any[];
    public static CHAIN_ID = 24680;
    public static PORT = 7545;

    public static async start() {
        if (GanacheServer.initialAccounts === undefined) {
            GanacheServer.initialAccounts = GanacheServer.CreateInitialAccounts();
        }

        GanacheServer.instance = ganache.server({
            chain: {
                chainId: GanacheServer.CHAIN_ID
            },
            miner: {
                blockGasLimit: 80000000,
                defaultGasPrice: 800
            },
            logging: {
                quiet: true
            },
            wallet: {
                accounts: GanacheServer.initialAccounts
            }
        });
        await GanacheServer.instance.listen(GanacheServer.PORT);
        return GanacheServer.instance;
    }

    public static CreateInitialAccounts(): any[] {
        const accounts: string[] = [];
        const reg_bytes64: RegExp = /^(0x)[0-9a-f]{64}$/i;

        // 0
        if (
            process.env.DEPLOYER !== undefined &&
            process.env.DEPLOYER.trim() !== "" &&
            reg_bytes64.test(process.env.DEPLOYER)
        ) {
            accounts.push(process.env.DEPLOYER);
        } else {
            process.env.DEPLOYER = Wallet.createRandom().privateKey;
            accounts.push(process.env.DEPLOYER);
        }

        // 1
        if (process.env.OWNER !== undefined && process.env.OWNER.trim() !== "" && reg_bytes64.test(process.env.OWNER)) {
            accounts.push(process.env.OWNER);
        } else {
            process.env.OWNER = Wallet.createRandom().privateKey;
            accounts.push(process.env.OWNER);
        }

        accounts.push(
            ...[
                "0x7ca325a11f5cfe1bd7ef855da5648401d4656befe7d5de3593ec6124af5dea80",
                "0x3c4d6de316cd98a06f9e0cfa089f588a72476a09e5973d63954c62760bce082f",
                "0xc860ffc63ee52cb62c09c8bc33a17f229c8166a76dad1313ea34043cbc105255",
                "0x5493e3296ea7e1440d4819fbb82c744309cc51a2e0169f41cd06bb934c73c8d9",
                "0xee503ec0fb2d3e5294c278c6c37f3677f22c050382458a3424a4ec186332cfc7",
                "0x00fbbc845c9d32e743951aab6e5e35bd2e01393411d13f378bfec14a72d94f94",
                "0xf4f585a034b0b3a46b134ea64ea3b2f3b530c80fcf4d460fcb19f8c91363efb0",
                "0xd6a95aa14323b8840053c926b3a84f1149947758720f9b1d7c298735bcac8d2a",
                "0x258d4f52de21c8ffb42aed3ddee2b469cd7d7d5242b50a07299937f4679c4219",
                "0xdb021c179bd8e243c70dda7c2efa62a8a4114ab5e5986faac96371604512d7c7",
                "0x4aaf934d621f5082f471f69481922a640d77eab0b9345b6f966a4b7fe00b5dd2",
                "0x4010ade993633d515f98cd3498a179f70737e9e57a06dcde82dc2881ecebd7a6",
                "0x7df5e9890b1fd58c5add1e0ba59471491fd9bf02a9375912f195526838d6cfc1",
                "0x9e370939034363cd0e6f1b3a1ed07deee58f5c9d72070dc2f6ce0dd1eecad207",
                "0xf5d58adaa27fcf318b8bc3471ae2bf52d76f210de8bbf33d653746aa48a2dac1",
                "0x647ad4826c66818bc5a5c8b278a0020bab158793dde4cdd0ee6007400f467d9e",
                "0x74e67a6a145fbb51ed2ba958d852181e4e3a77cacb5c626c0d66b015f049e7fe",
                "0x0ad51122ca7f55a11da98e023b4c2c190a312bcf07989041595a24f0d53fc4d3",
                "0xabe321089a7a0dd3246ec099a8034b040e3e339bca113e4f97191606a377c6f1",
                "0x3ece64cc9380172d75fe02aaffc9ef1ddca5b76bd4a181ee9ba75a990418ee14",
                "0x22a3f6cd2df92e70d27c5d9072f3b6e04fac0ef83d8bf8e24b8c168942741d9b",
                "0xa8d6a84a822af6bf45cc61b547edf0074dca153a204cca474f68eec5c0d24033",
                "0x2d4bd4473c9d5a28a1b7fe5511fabdfbe55224f2aa5e493bd5baf8d41dde8beb",
                "0xb5f26c24dae120e68b02674875bbf02aca507125d175703bf1748cac171cf3b8",
                "0x02b2c8c00cff3ddf87ab87f618195d3ee829b1ff45b80e69f5b0a2251dfb5325",
                "0xc4954e3374501d423a5a852b1a4b7a37abfa6e9b4d24db66fd628115e79f3ee9",
                "0xe73b3ca16096550a501a4a318438997987529b828c55f66a62d9a9e75977b312",
                "0x944f05d19331d20b51cf4beb59f8a769d5aa81c1c3185ee1c1a98198ae79958a",
                "0x80600569f39416792e647a3c03eb8d2a1d97423835e73e6a425c8213e1a578e6",
                "0x873a757885d547135b7673a42242e77aae5c9c8b290087e05914c5827a1965a7",
                "0xf974352f3f1a4d42b0d7414134bd5c7125a08a02450f991eda6a1ccca9020ee3",
                "0x9742d9598fdb1f5a20b5343f9b2b34488a25a0627274eef1d58b78d6e943ffb4",
                "0x290b2d6b1f69a0ee6315afb691af6c047dcc3fab47aefcdf70ea75247a868611",
                "0x6ec13e3bc4d1d8f89a3c3863db5107fe6e8e4bea1993151e50f9f04ddc914c8f",
                "0x2fb6ca7807d0e70989458bdf62db5dda3e286c835ddcf91e97db940b04de7b19",
                "0x831413e033feb5a196df3802c1f7147aac24b23141b378a00b35a945a7c3d97c",
                "0xe37b4a1a73d7c64e4a5f5472c5328dc158a2c1e69352c17065bbc1fc430a8c9f",
                "0x8c7338185e54cdf6260885375b43fef5492d9da53ee0cf1e558521f10b86ac52",
                "0x4331b946812810a28e45a517a2dbff941b1299bc3f50b0b3330ffc71ef281a73",
                "0xa8f57b2dc1cc38ae052cfc2788b3d3e2dddd9ef86ba38d4be5dd7339ee76913f",
                "0x80f11cbc025cefb2e0972c1d3858d7be756588174cc6f68e5f09d7d6240db28a",
                "0x08c843a135700eccf10159fb5b16f1cc2328e95a32c9ba3673090297fef814f8",
                "0x0aaa7a7d5ca6cfcdbf26dc958465366edc4db4235fab12815d092b7b00dc53e6",
                "0xeb479c0333fbf9442f5054423070db156a75cf76a6076d470d95d9b0be07daf3",
                "0x84400fa580b140adac499b1fde31c140ce8d66df9a512023b9da95376146677a",
                "0xd196ebe3d28e1037110781389f3b2d9531ed6e3dbb2d2ca49ae2f5472cb1d9dd",
                "0x79291ebeee5e33fa28d7b8a8bb02e47c6ed04ef1036abbac7d51b36811d0589e",
                "0xbc6d76115159dfac759b3e26f2f1c34725ffc91d24c60fd8d8a0f239a7df7d4b",
                "0x3370a9e2652e8af6cd74fded1c828bcb3c6c037924c71302bab070144515bfa5",
                "0x7d30d416b10260fc8945978814065347f0007cdead80a34d4a0afd20701c4cde",
                "0x8966947a5641802ab190999a7e260445ff1fbb7a6d1a8c5c97b9b13079dee5dd",
                "0x62d5daa596120cc82e00c01499e005cfe4fb9b28e5f5f986a4dd43f184b54b49",
                "0x961a9305c8a9fee20c38b6af55546be8156540ab82af8f910711d8996a98e623",
                "0xe82459a29d7518227d39b2c704e22f1132da73eb062329c6b134417dda4df89c",
                "0x555997c3c1b4f73edfaba362d9be646f93a97ae101b86fc62500752f45c13e8b",
                "0x95549b759fbf82029f54f34776920d95d3fc7bc36309507b867b69142c74fcff",
                "0x256c17d5c423bc95d05f680314e09a37ee6c73dd64840289fdad957d21b9c457",
                "0x3f49faf5d5d006d3649f0af11e882691d2e40c87abc56f9c511b10ebfea71278",
                "0xccb5806330023b417c18d7192bfd983ba5d271c13cd5b74267f357ebc1ef2039",
                "0x0371d9a32f491e26a17efb5dad7f669194d21c5cc1778708f4552dea9f89fae7",
                "0x134abac96605ebb23463a7f2723438ab65502bf3a7313de32a39eb5d219bd9bc",
                "0xf410880ce79d904c1b519c926f781d733cdd97b4a50f083973e7695ac9169fdd"
            ]
        );

        return accounts.map((m) => {
            return {
                balance: "0x100000000000000000000000000000000000000000000000000000000",
                secretKey: m
            };
        });
    }

    public static accounts(): Wallet[] {
        if (GanacheServer.initialAccounts === undefined) {
            GanacheServer.initialAccounts = GanacheServer.CreateInitialAccounts();
        }
        return GanacheServer.initialAccounts.map((m) =>
            new Wallet(m.secretKey).connect(GanacheServer.createTestProvider())
        );
    }

    public static createTestProvider(): JsonRpcProvider {
        return new JsonRpcProvider(`http://localhost:${GanacheServer.PORT}`, GanacheServer.CHAIN_ID);
    }

    public static setTestProvider(provider: JsonRpcProvider) {
        contextParamsLocalChain.web3Providers = provider;
    }

    public static setTestWeb3Signer(signer: Signer) {
        contextParamsLocalChain.signer = signer;
    }
}
