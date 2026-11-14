import VideoPlayerComponent from './index.vue'
import { withInstall } from '../core/install'
import type { VideoPlayerInstance, VideoPlayerProps } from '../types/player'

export const VideoPlayer = withInstall(VideoPlayerComponent)

export type { VideoPlayerInstance, VideoPlayerProps }

export default VideoPlayer
