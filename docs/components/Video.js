const Video = () => {
    return ( 
        <div className="aspect-w-16 aspect-h-9">
            {/* https://www.youtube-nocookie.com/embed/pp41ZqRrrak?autoplay=1&mute=1&autohide=1&modestbranding=1&iv_load_policy=3&rel=0 */}
            <iframe src="https://www.youtube-nocookie.com/embed/pPFORkjNyMQ?autoplay=1&mute=1&autohide=1&modestbranding=1&iv_load_policy=3&rel=0&loop=1" title="Startup.Games" frameBorder={0} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
     );
}
 
export default Video;