import StorageManager from "./storageManager";

export default class SoundsManager {

    static ins: SoundsManager = null;

    static init() {
        this.ins = new SoundsManager();

    }

    private isBGMMute: boolean = false;
    private isEffectMute: boolean = false;

    curBGM: string = null;

    get IsBGMMute(): boolean {
        return this.isBGMMute;
    }
    get IsEffectMute(): boolean {
        return this.isEffectMute;
    }

    private constructor() {
        this.isBGMMute = StorageManager.ins.getData("isBGMMute")
        if (this.isBGMMute === null)
            this.isBGMMute = false;

        this.isEffectMute = StorageManager.ins.getData("isEffectMute")
        if (this.isEffectMute === null)
            this.isEffectMute = false;
    }

    openBGM() {
        if (this.isBGMMute) {
            this.isBGMMute = false;
            StorageManager.ins.storageData("isBGMMute", false);

            if (this.curBGM)
                this.playBGM(this.curBGM);
        }
    }

    closeBGM() {
        if (!this.isBGMMute) {
            this.isBGMMute = true;
            StorageManager.ins.storageData("isBGMMute", true);

            cc.audioEngine.pauseMusic();
        }
    }

    openEffect() {
        if (this.isEffectMute) {
            this.isEffectMute = false;
            StorageManager.ins.storageData("isEffectMute", false);
        }
    }

    closeEffect() {
        if (!this.isEffectMute) {
            this.isEffectMute = true;
            StorageManager.ins.storageData("isEffectMute", true);
            cc.audioEngine.stopAllEffects();
        }
    }

    /**
     * 播放背景音乐
     * @param url 文件路径
     */
    playBGM(url: string) {
        if (this.isBGMMute)
            return;

        cc.loader.loadRes(url, cc.AudioClip, function (e, clip) {
            cc.audioEngine.playMusic(clip, true);
        }.bind(this))
    }

    /**
     * 播放音效
     * @param url 文件路径
     */
    playEffect(url: string) {
        if (this.isEffectMute)
            return;

        cc.loader.loadRes(url, cc.AudioClip, function (e, clip) {
            cc.audioEngine.playEffect(clip, false);
        })
    }

}