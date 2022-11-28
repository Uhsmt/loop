import * as PIXI from 'pixi.js';
import { Butterfly } from './butterfly';
import { Stage } from './stage';
import { Message } from './message';
import { LoopArea } from './rope';
import * as Utility from './utility';
import { myConsts, ButterflySizeType } from './const';
import { clear } from 'console';
import { resolve } from 'path';

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
    isFinish = false;
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
        const scoreProgress = new Message(`0 / ${this.clearCondition}`, 25);

        scoreProgress.name = 'scoreProgress';
        scoreProgress.x = this.app.screen.width / 2;
        scoreProgress.y = this.app.screen.height - 25;
        this.MESSAGE_CONTAINER.addChild(scoreProgress);
        scoreProgress.alpha = 0;
        this.scoreProgress = scoreProgress;
        // scoreProgress.show(false,30)
    }

    initialize()
    {
        console.log(`initialize:${this.level}`);
        super.initialize();
        const backgroundSprite = new PIXI.Sprite(this.app.loader.resources.background.texture);

        backgroundSprite.name = 'backgroundSprite';
        backgroundSprite.x = -400;
        backgroundSprite.y = -this.app.screen.height + 200;
        this.BACKGROUND_CONTAINER.addChild(backgroundSprite);
    }

    async start()
    {
        return new Promise<boolean>(async (resolve) =>
        {
            console.log('stage start');
            this.setRope(40);

            const levelMsg = new Message(`LEVEL${this.level}`, 30);

            levelMsg.x = this.app.view.width / 2;
            levelMsg.y = this.app.view.height / 3;

            const missionMsg = new Message(`mission: ${this.clearCondition} buterflies`, 25);

            missionMsg.x = this.app.view.width / 2;
            missionMsg.y = this.app.view.height / 2;

            this.MESSAGE_CONTAINER.addChild(levelMsg);
            this.MESSAGE_CONTAINER.addChild(missionMsg);

            await Promise.all([
                levelMsg.show(true, 80),
                missionMsg.show(true, 80)
            ]);

            const gameResult = await this.play();

            resolve(gameResult);
        });
    }

    showResult(gameResult:boolean)
    {
        const stickySprite = new PIXI.Sprite(this.app.loader.resources.sticky.texture);

        stickySprite.name = 'stickySprite';
        stickySprite.scale.set(0.2);
        stickySprite.x = this.app.screen.width / 2;
        stickySprite.y = this.app.screen.height / 2;
        stickySprite.anchor.set(0.5);

        this.BACKGROUND_CONTAINER.addChild(stickySprite);

        let bonusCount = this.capturedCount - this.clearCondition;

        if (bonusCount < 0)
        {
            bonusCount = 0;
        }
        const totalScore = this.score + (bonusCount * 100);

        const topMsg =  new Message(gameResult ? `level ${this.level} clear!!` : 'game over', 30);
        const conditionMsg = new Message(`I need ${this.clearCondition} butterflies.`, 20);
        const countMsg = new Message(`You caught ${this.capturedCount} butterflies.`, 20);
        const lineMsg = new Message('----', 30);
        const baseScoreMsg = new Message(`base score : ${this.score}`, 20);
        const bonusMsg = new Message(`bonus score : ${bonusCount} × 100 = ${bonusCount * 100}`, 20);
        const totalScoreMsg = new Message(`total score : ${totalScore}`, 30);

        const msgs = [topMsg, conditionMsg, countMsg, lineMsg, baseScoreMsg, bonusMsg, totalScoreMsg];

        msgs.forEach((msg, index) =>
        {
            this.MESSAGE_CONTAINER.addChild(msg);
            msg.x = this.app.screen.width * 0.5;
            msg.y = 100 + (this.app.screen.height * 0.1 * index);
            if (msg === lineMsg)
            {
                msg.show(false, 30);
            }
            else
            {
                setTimeout(() =>
                {
                    msg.show(false, 30);
                }, 300 * index);
            }
        });
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
        console.log('finish');
        const butterflies = <Butterfly[]> this.GAME_CONTAINER.children;

        for (const butterfly of butterflies)
        {
            butterfly.delete();
        }
        // this.scoreProgress.delete(); TODO deleteできえない tickerが破壊された？
        this.scoreProgress.visible = false;
        this.isFinish = true;
        console.log('ゲーム終了！');
    }

    private async play()
    {
        return new Promise<boolean>(async (resolve) =>
        {
            console.log('play');
            this.createButterflies();
            this.scoreProgress.alpha = 1;
            // click and freeze
            this.app.renderer.view.addEventListener('pointerup', () =>
            {
                this.stageClick();
            });

            const sun = new Sun();

            sun.y = this.app.screen.height;
            this.BACKGROUND_CONTAINER.addChild(sun);
            let totalFrame = 0;
            let isBlink = false;

            const ticker = new PIXI.Ticker();

            // move sun and judge clear
            ticker.add(async (delta) =>
            {
                if (this.isPause)
                {
                    return;
                }
                else if (this.capturedCount >= this.clearCondition)
                {
                    this.finish();
                    ticker.destroy();
                    await this.dispMessage('\n\nおわり！');
                    setTimeout(() => { resolve(true); }, 500);
                }

                totalFrame += delta;
                const ms = totalFrame / 60;
                const degree = 180 * (totalFrame / (this.gameTime * 60));
                const radian = degree * (Math.PI / 180);

                sun.x = this.app.screen.width * (totalFrame / (this.gameTime * 60));
                sun.y = this.app.screen.height - (Math.sin(radian) * this.app.screen.height * 0.5);

                if (!isBlink && ms >= this.gameTime - 10)
                {
                    sun.blink();
                    isBlink = true;
                }
                if (ms >= this.gameTime)
                {
                    this.finish();
                    ticker.destroy();
                    await this.dispMessage('\n時間ぎれ！');
                    setTimeout(() => { resolve(false); }, 1000);
                }
            });
            ticker.start();
        });
    }

    private stageClick()
    {
        if (this.isFinish)
        {
            return;
        }

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
            const msgObj = new Message(message, 30);

            msgObj.name = 'freezeMsg';
            msgObj.x = this.app.view.width / 2;
            msgObj.y = this.app.view.height / 2;

            this.MESSAGE_CONTAINER.addChild(msgObj);
            msgObj.show(false, 30);
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

                this.dispMessage(message);
                for (const cb of captureButterflies)
                {
                    cb.delete();
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

    private async dispMessage(message:string)
    {
        return new Promise<void>((resolve) =>
        {
            const msgObj = new Message(message, 30);

            msgObj.x = this.app.view.width / 2;
            msgObj.y = this.app.view.height / 2;

            this.MESSAGE_CONTAINER.addChild(msgObj);
            msgObj.show(true, 30).then((res) =>
            {
                resolve();
            });
        });
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
