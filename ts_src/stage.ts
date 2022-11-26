import * as PIXI from 'pixi.js';
import { Rope } from './rope';

export abstract class Stage
{
    app:PIXI.Application;
    // BASE_CONTAINER = new PIXI.Container();
    BACKGROUND_CONTAINER = new PIXI.Container();
    GAME_CONTAINER = new PIXI.Container();
    MESSAGE_CONTAINER = new PIXI.Container();
    ROPE_CONTAINER = new PIXI.Container();
    isDrawable = true;
    beforePosx = 0;
    beforePosy = 0;

    constructor(app:PIXI.Application)
    {
        this.app = app;
    }

    initialize()
    {
        // this.app.stage.addChild(this.BASE_CONTAINER);
        this.app.stage.addChild(this.BACKGROUND_CONTAINER);
        this.app.stage.addChild(this.GAME_CONTAINER);
        this.app.stage.addChild(this.ROPE_CONTAINER);
        this.app.stage.addChild(this.MESSAGE_CONTAINER);
    }

    protected setRope(maxLength:number)
    {
        maxLength ||= 50;

        this.app.ticker.add(() =>
        {
            if (!this.isDrawable)
            {
                return;
            }
            let posx = Math.floor(this.app.renderer.plugins.interaction.mouse.global.x);
            let posy = Math.floor(this.app.renderer.plugins.interaction.mouse.global.y);

            // x adjust
            if (posx < 0)
            {
                posx = 0;
            }
            else if (this.app.screen.width < posx)
            {
                posx = this.app.screen.width;
            }

            // y adjust
            if (posy < 0)
            {
                posy = 0;
            }
            else if (this.app.screen.height < posy)
            {
                posy = this.app.screen.height;
            }

            // Ropeをかく
            if (posx >= 0 && posx <= this.app.screen.width && posy >= 0 && posy <= this.app.screen.height
          && posx !== this.beforePosx && posy !== this.beforePosy)
            {
                if (this.beforePosx === 0 && this.beforePosy === 0)
                {
                    this.beforePosx = posx;
                    this.beforePosy = posy;

                    return;
                }
                const addRope = new Rope(this.beforePosx, this.beforePosy, posx, posy);

                this.beforePosx = posx;
                this.beforePosy = posy;

                if (this.ROPE_CONTAINER.children !== null && this.ROPE_CONTAINER.children.length > maxLength)
                {
                // TODO 長さでもある程度判定入れたいな
                    this.ROPE_CONTAINER.removeChildAt(0);
                }

                // loop判定
                let loopStart = false;
                const points:number[] = [];

                // 最後に追加されたropeオブジェクトは必ず一端が接触するため、その一つ前まで検証。
                for (let i = 0; i < this.ROPE_CONTAINER.children.length - 1; i++)
                {
                    const child:Rope  = <Rope> this.ROPE_CONTAINER.children[i];

                    if (!loopStart && child.lineSegment.isCross(addRope.lineSegment))
                    {
                        loopStart = true;
                    }
                    if (loopStart)
                    {
                        points.push(child.position.x, child.position.y);
                    }
                }
                if (points.length > 0)
                {
                    this.loop(points);
                }
                else
                {
                    this.ROPE_CONTAINER.addChild(addRope);
                }
            }
        });
    }

    protected deleteRoop()
    {
        this.ROPE_CONTAINER.removeChildren();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
    protected loop(points:number[]) {}
}
