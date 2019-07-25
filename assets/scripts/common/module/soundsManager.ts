export default class SoundsManager {
    /**
     * cc.sys.localStorage
     */
    private ls = cc.sys.localStorage;
    /**
     * 是否初始化本地存储对象
     * @param inited 
     */
    constructor() {
        let v: string = this.ls.getItem("isBGMMute");
        if (v === null) { //不存在本地数据
            this.ls.setItem("isBGMMute", 0);
            this.ls.setItem("isEffectMute", 0);
        }
        else {
            if (this.getIsBGMMute())
                cc.audioEngine.setMusicVolume(0);
            if (this.getIsEffectMute())
                cc.audioEngine.setEffectsVolume(0);
        }
    }

    setIsBGMMute(v: boolean) {
        if (v) {
            this.ls.setItem("isBGMMute", 1);
            cc.audioEngine.setMusicVolume(0);
        }
        else {
            this.ls.setItem("isBGMMute", 0);
            cc.audioEngine.setMusicVolume(1);
        }
    }

    getIsBGMMute(): boolean {
        let r: string = this.ls.getItem("isBGMMute");
        if (r === "1")
            return true;
        return false;
    }

    setIsEffectMute(v: boolean) {
        if (v) {
            this.ls.setItem("isEffectMute", 1);
            cc.audioEngine.setEffectsVolume(0);
        }
        else {
            this.ls.setItem("isEffectMute", 0);
            cc.audioEngine.setEffectsVolume(1);
        }
    }

    getIsEffectMute(): boolean {
        let r: string = this.ls.getItem("isEffectMute");
        if (r === "1")
            return true;
        return false;
    }


    /**
     * 播放背景音乐
     * @param url 文件路径
     */
    playBGM(url: string) {
        cc.loader.loadRes(url, cc.AudioClip, function (e, clip) {
            cc.audioEngine.playMusic(clip, true);
        }.bind(this))
    }

    /**
     * 播放音效
     * @param url 文件路径
     */
    playEffect(url: string) {
        let isEffectMute: string = this.ls.getItem("isEffectMute");

        if (isEffectMute === "1")
            return;
        cc.loader.loadRes(url, cc.AudioClip, function (e, clip) {
            cc.audioEngine.playEffect(clip, false);
        })
    }

}