import * as PIXI from 'pixi.js';
import { Butterfly } from './butterfly';
import { Stage } from './stage';
import { Message } from './message';
import { LoopArea } from './rope';
import * as Utility from './utility';
import { myConsts, ButterflySizeType } from './const';

class Sun extends PIXI.Container
{
    constructor()
    {
        super();
        this.name = 'sun';
        const sprite = PIXI.Sprite.from('./images/sun.png');

        sprite.scale.set(0.7);
        sprite.anchor.set(0.5);
        sprite.name = 'normalSprite';
        this.addChild(sprite);
    }
    blink()
    {
        const textures = [];

        for (let i = 0; i < 2; i++)
        {
            textures.push(PIXI.Texture.from(`sun_${i + 1}.png`));
        }
        const blinkSprite = new PIXI.AnimatedSprite(textures);

        blinkSprite.scale.set(0.7);
        blinkSprite.anchor.set(0.5);
        blinkSprite.animationSpeed = 0.03;
        blinkSprite.play();
        this.removeChildAt(0);
        this.addChild(blinkSprite);
    }
}

export class GameStage extends Stage
{
    colors:number[];
    level:number;
    sizeType:string;
    butterflyNum:number;
    clearCondition:number;
    haveSwitch = false;
    haveMultiple = false;
    isDrawable = true;
    isPause = false;
    isBonus = false;
    multipleProbability = 30;
    score = 0;
    capturedCount = 0;
    beforePosx = 0;
    beforePosy = 0;
    scoreProgress: Message;
    readonly gameTime = 60;

    constructor(level:number,
        butterflyNum:number,
        colorNum:number,
        sizeType:string,
        clearCondition:number,
        app:PIXI.Application// TODO appはグローバルにできないかな
    )
    {
        super(app);
        this.level = level;
        this.sizeType = sizeType;
        this.butterflyNum = butterflyNum;
        this.clearCondition = clearCondition;
        this.colors = Utility.chooseAtRandom(myConsts.COLOR_LIST, colorNum);
        this.app = app;

        // underdisp
        const scoreProgress = new Message(`0 / ${this.clearCondition}`, 25, false, 30);

        scoreProgress.name = 'scoreProgress';
        scoreProgress.x = this.app.screen.width / 2;
        scoreProgress.y = this.app.screen.height - 25;
        this.MESSAGE_CONTAINER.addChild(scoreProgress);
        scoreProgress.alpha = 0;
        this.scoreProgress = scoreProgress;
    }

    initialize()
    {
        console.log(`initialize:${this.level}`);
        super.initialize();
        const backgroundSprite = new PIXI.Sprite(this.app.loader.resources.background.texture);

        backgroundSprite.name = 'backgroundSprite';
        backgroundSprite.x = -400;
        backgroundSprite.y = -200 - this.app.screen.height;
        this.BACKGROUND_CONTAINER.addChild(backgroundSprite);
    }

    start()
    {
        console.log('start');
        // Rope
        this.setRope(40);
        // this.createButterflies();

        const msgObj = new Message(`LEVEL${this.level}`, 30, false, 30);

        msgObj.x = this.app.view.width / 2;
        msgObj.y = this.app.view.height / 3;

        this.MESSAGE_CONTAINER.addChild(msgObj);

        // this.play();
    }

    gameTest()
    {
        this.createButterflies();
    }

    testConsole()
    {
        // console.log(BACKGROUND_CONTAINER);
        console.log(this.GAME_CONTAINER);
        console.log(this.ROPE_CONTAINER);
        console.log(this.MESSAGE_CONTAINER);
        console.log(this);
    }

    startAnimation()
    {
        this.app.ticker.start();
        this.freeze(false, 'freeze');
    }

    stopAnimation()
    {
        this.freeze(true, 'freeze');
        this.app.ticker.stop();
    }

    drawingStop()
    {
        this.isDrawable = false;
    }

    finish()
    {
        const butterflies = <Butterfly[]> this.GAME_CONTAINER.children;

        for (const butterfly of butterflies)
        {
            butterfly.delete();
        }
        this.scoreProgress.delete();
        console.log('ゲーム終了！');
    }

    private play()
    {
        console.log('play');
        this.scoreProgress.alpha = 1;
        // click and freeze
        this.app.renderer.view.addEventListener('pointerup', () =>
        {
            this.stageClick();
        });

        // sun moving and gameTimer
        const sun = new Sun();

        sun.y = this.app.screen.height;
        this.BACKGROUND_CONTAINER.addChild(sun);
        let totalFrame = 0;
        let isBlink = false;

        const ticker = new PIXI.Ticker();

        ticker.add((delta) =>
        {
            if (this.isPause || this.capturedCount >= this.clearCondition)
            {
                return;
            }
            totalFrame += delta;
            const degree = 180 * (totalFrame / (this.gameTime * 60));
            const radian = degree * (Math.PI / 180);

            sun.x = this.app.screen.width * (totalFrame / (this.gameTime * 60));
            sun.y = this.app.screen.height - (Math.sin(radian) * this.app.screen.height * 0.5);
            const ms = totalFrame / 60;

            if (!isBlink && ms >= this.gameTime - 10)
            {
                sun.blink();
                isBlink = true;
            }
            if (ms >= this.gameTime)
            {
                this.finish();
                this.dispMessage('\n時間ぎれ！');
                ticker.destroy();
            }
        });
        ticker.start();
    }

    private stageClick()
    {
        if (this.isPause)
        {
            this.freeze(false, 'pause');
            this.isDrawable = true;
            this.isPause = false;
        }
        else
        {
            this.freeze(true, 'pause');
            this.isDrawable = false;
            this.isPause = true;
        }
        this.beforePosx = 0;
        this.beforePosy = 0;
        this.deleteRoop();
    }

    private createButterflies()
    {
        for (let i = 0; i < this.butterflyNum; i++)
        {
            this.createButterfly();
        }
    }

    private createButterfly()
    {
        const size = this.getButterflySize();
        const multiplicationRate = this.getMultipleRandom();
        const randomTwoColors = Utility.chooseAtRandom(this.colors, 2);
        const mainColor = randomTwoColors[0];
        const subColor = (this.haveSwitch) ? randomTwoColors[1] : mainColor;
        const butterfly = new Butterfly(size, mainColor, subColor, multiplicationRate, this.app);

        this.GAME_CONTAINER.addChild(butterfly);
        butterfly.show();
        butterfly.fly(this.ROPE_CONTAINER);
        if (this.isPause)
        {
            butterfly.stop();
        }
    }

    private getButterflySize():string
    {
        return (this.sizeType === null) ? Utility.chooseAtRandom(Object.values(ButterflySizeType), 1)[0] : this.sizeType;
    }

    private getMultipleRandom():number
    {
        return (this.haveMultiple && Utility.isTrueRandom(this.multipleProbability)) ? Math.round(Math.random() * 5) : 1;
    }

    private freeze(on:boolean, message:string)
    {
        for (const child of this.GAME_CONTAINER.children)
        {
            if (child !== null && child instanceof Butterfly)
            {
                const butterfly: Butterfly = <Butterfly>child;

                if (on)
                {
                    butterfly.stop();
                }
                else
                {
                    butterfly.restartFly();
                    butterfly.isFrapping = true;
                }
            }
        }
        if (on)
        {
            const msgObj = new Message(message, 30, false, 30);

            msgObj.name = 'freezeMsg';
            msgObj.x = this.app.view.width / 2;
            msgObj.y = this.app.view.height / 2;

            this.MESSAGE_CONTAINER.addChild(msgObj);
        }
        else
        {
            this.MESSAGE_CONTAINER.getChildByName('freezeMsg').destroy();
        }
    }

    protected loop(points:number[])
    {
        if (this.isPause)
        {
            return;
        }
        this.isDrawable = false;
        this.deleteRoop();
        const butterflies = this.GAME_CONTAINER.children;

        const loopArea = new LoopArea(points);

        this.GAME_CONTAINER.addChild(loopArea);

        const captureButterflies = [];
        let caputredNum = 0;

        if (butterflies)
        {
            for (const butterfly of butterflies)
            {
                if (!(butterfly instanceof Butterfly))
                {
                    continue;
                }
                const p = new PIXI.Point(butterfly.x, butterfly.y);
                const hit = this.app.renderer.plugins.interaction.hitTest(p, loopArea);

                if (hit && hit.name === 'loopObj')
                {
                    captureButterflies.push(butterfly);
                }
            }
        }
        if (captureButterflies.length === 1)
        {
            captureButterflies[0].switchColor();
            this.isDrawable = true;
        }
        else if (captureButterflies.length > 1)
        {
            const colors = Array.from(new Set(captureButterflies.map((b) => b.dispColor)));

            if ((colors.length >= 3 && colors.length === captureButterflies.length)
        || colors.length === 1)
            {
                caputredNum = captureButterflies.length;
                const calcrateResult = scoreCalcrate(captureButterflies);

                this.capturedCount += caputredNum;
                this.updateCount();
                this.score += calcrateResult.score;
                const message = `${calcrateResult.formula}`;

                if (this.capturedCount >= this.clearCondition)
                {
                    // message += '\n\nおわり！';
                    this.dispMessage('\n\nおわり！');
                }

                this.dispMessage(message);
                for (const cb of captureButterflies)
                {
                    cb.delete();
                }
                if (this.capturedCount >= this.clearCondition)
                {
                    this.finish();

                    return;
                }
            }
            else
            {
                const message = 'Bad Loop!\n-20pt';

                this.dispMessage(message);
                this.score -= 20;
            }
        }
        else
        {
            this.isDrawable = true;
        }
        loopArea.delete(() =>
        {
            if (!this.isPause)
            {
                this.isDrawable = true;
            }
            for (let i = 0; i < caputredNum; i++)
            {
                this.createButterfly();
            }

            console.log(`SCORE:${this.score}`);
        });
    }

    private dispMessage(message:string)
    {
        const msgObj = new Message(message, 30, true, 30);

        msgObj.x = this.app.view.width / 2;
        msgObj.y = this.app.view.height / 2;

        this.MESSAGE_CONTAINER.addChild(msgObj);
    }

    private updateCount()
    {
        const newText = `${this.capturedCount} / ${this.clearCondition}`;

        this.scoreProgress.text = newText;
        this.scoreProgress.message = newText;
    }
}

/**
 * 得点計算
 * @param butterflies
 * @returns score
 */
function scoreCalcrate(butterflies:Butterfly[])
{
    let score = 0;
    const colors = Array.from(new Set(butterflies.map((b) => b.dispColor)));

    if (colors.length === 1)
    {
        // 10,20,30,40....
        score = 10 * (butterflies.length - 1);
    }
    else
    {
        // 30,60,100...
        score = colors.length * ((colors.length - 1) * 5);
    }

    let formulaText = score.toString();
    let hasMultipl = false;

    for (const butterfly of butterflies)
    {
        if (butterfly.multiplicationRate > 1)
        {
            hasMultipl = true;
            score = score * butterfly.multiplicationRate;
            formulaText += `× ${butterfly.multiplicationRate}`;
        }
    }
    if (hasMultipl)
    {
        formulaText += (` = ${score.toString()}`);
    }

    return {
        score,
        formula: `${formulaText}pt`
    };
}
