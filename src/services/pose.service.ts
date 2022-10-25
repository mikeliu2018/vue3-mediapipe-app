import { Camera } from "@mediapipe/camera_utils";
// import { LandmarkGrid } from "@mediapipe/control_utils_3d";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import type { Options, Results } from "@mediapipe/pose";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { LogService } from "./log.service";
import { WebsocketBuilder } from "websocket-ts";
import { useAuthStore } from "@/stores";
import type { Ref } from "vue";
// import { RootState } from "@/store/types";
// import { Getter, Action } from "vuex-class";

export class PoseService extends Camera {
  private readonly pipe = new Pose({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
  });

  private readonly ctx: CanvasRenderingContext2D;
  private logService = new LogService();

  private readonly wsConnectUrl = `ws://localhost:3000/?credential=${
    useAuthStore().getCredential
  }`;

  private ws = new WebsocketBuilder(this.wsConnectUrl)
    .onOpen((i, ev) => {
      console.log("opened", i, ev);
    })
    .onClose((i, ev) => {
      console.log("closed", i, ev);
    })
    .onError((i, ev) => {
      console.log("error", i, ev);
    })
    .onMessage((i, ev) => {
      console.log("message", i, ev);
    })
    .onRetry((i, ev) => {
      console.log("retry", i, ev);
    });

  constructor(
    public readonly canvas: HTMLCanvasElement,
    public readonly source: HTMLVideoElement,
    public readonly canvasWidth: number,
    public readonly canvasHeight: number,
    public readonly landmarkContainer: HTMLDivElement,
    public readonly loadingCanvas: Ref<boolean>
  ) {
    super(source, {
      onFrame: async () => await this.pipe.send({ image: source }),
      width: canvasWidth,
      height: canvasHeight,
    });

    source.addEventListener("loadedmetadata", () => {
      this.canvas.height = source.videoHeight;
      this.canvas.width = source.videoWidth;
    });

    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  /**
   *
   * @param options {@link https://google.github.io/mediapipe/solutions/pose.html#javascript-solution-api|Mediapipe}
   */
  public setOptions(options: Options): Promise<void> {
    this.pipe.onResults((results) => this.render(results));
    this.pipe.setOptions(options);
    return this.start();
  }

  public render({
    poseLandmarks,
    // segmentationMask,
    // poseWorldLandmarks,
    image,
  }: Results): void {
    // const grid = new LandmarkGrid(this.landmarkContainer);

    // if (!poseLandmarks) {
    //   grid.updateLandmarks([]);
    //   return;
    // }
    if (this.loadingCanvas.value) {
      this.loadingCanvas.value = false;
      this.logService.debug_log("this.loadingCanvas.value is change.");
      this.ws.build();
    }

    const { width, height } = this.canvas;
    // this.logService.delay_log(10, "width: %d, height: %d", width, height);
    // this.logService.delay_log(10, "poseLandmarks", poseLandmarks);

    this.ctx.save();
    this.ctx.clearRect(0, 0, width, height);
    // this.ctx.drawImage(segmentationMask, 0, 0, width, height);

    // Only overwrite existing pixels.
    this.ctx.globalCompositeOperation = "source-in";
    this.ctx.fillStyle = "#00FF00";
    this.ctx.fillRect(0, 0, width, height);

    // Only overwrite missing pixels.
    this.ctx.globalCompositeOperation = "destination-atop";
    this.ctx.drawImage(image, 0, 0, width, height);

    this.ctx.globalCompositeOperation = "source-over";
    drawConnectors(this.ctx, poseLandmarks, POSE_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 4,
    });
    drawLandmarks(this.ctx, poseLandmarks, { color: "#FF0000", lineWidth: 2 });

    this.ctx.restore();

    // grid.updateLandmarks(poseWorldLandmarks);

    // this.ws.send(
    //   JSON.stringify({
    //     timesteamp: Math.floor(Date.now() / 1000),
    //     poseLandmarks: poseLandmarks,
    //   })
    // );
  }
}
