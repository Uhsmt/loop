import { resolve } from 'path';
import * as PIXI from 'pixi.js';

export class Message extends PIXI.Text
{
    message:string;
    ticker = new PIXI.Ticker();
    keepFrame = 30;

    constructor(message:string, size:number)
    {
        super(message);
        this.message = message;
        this.style = new PIXI.TextStyle({
            fontFamily: this.isJapanese() ? 'Yomogi' : 'Neucha',
            fontSize: (this.isJapanese() ? 1 : 1.2) * size,
            fontWeight: 'bold',
            fill: ['#111111'],
            wordWrap: true,
            wordWrapWidth: 440,
            lineJoin: 'round',
            align: 'center',
            whiteSpace: 'pre-line',
        });
        this.anchor.set(0.5);
        this.alpha = 0;

        // console.log(`${this.message}:${this.isJapanese()}:${this.style.fontFamily}`);
    }
    async show(autohide:boolean, keepFrame:number)
    {
        this.alpha = 1;
        this.keepFrame = keepFrame;
        this.ticker.start();
        if (autohide)
        {
            return this.delete();
        }
    }

    async delete()
    {
        let frame = 0;

        return new Promise<void>((resolve) =>
        {
            this.ticker.add(() =>
            {
                frame += 1;
                if (frame <= this.keepFrame)
                {
                    return;
                }
                this.alpha -= 0.02;
                if (this.alpha <= 0.1)
                {
                    this.ticker.destroy();
                    this.destroy();
                    resolve();
                }
            });
        });
    }
    isJapanese()
    {
        const regexpHiragana = /[\u{3000}-\u{301C}\u{3041}-\u{3093}\u{309B}-\u{309E}]/mu;
        const regexpKatakana = /[\u{3000}-\u{301C}\u{30A1}-\u{30F6}\u{30FB}-\u{30FE}]/mu;
        const regexpKanji = /([\u{3005}\u{3007}\u{303b}\u{3400}-\u{9FFF}\u{F900}-\u{FAFF}\u{20000}-\u{2FFFF}][\u{E0100}-\u{E01EF}\u{FE00}-\u{FE02}]?)/mu;

        return regexpHiragana.test(this.message) || regexpKatakana.test(this.message) || regexpKanji.test(this.message);
    }
}
