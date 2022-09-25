import { useQuery } from "react-query";
import { getMovies, IGetMoviesResult } from '../api';
import styled from 'styled-components';
import { makeImagePath } from "../utils";
import { motion, AnimatePresence, useViewportScroll } from "framer-motion";
import { useState } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";

const Wrapper = styled.div`
    background: black;
`;

const Loader = styled.div`
 height: 20vh;
 display: flex;
 justify-content: center;
 align-items: center;
`;

const Slider = styled.div`
 position: relative;
`;

const Row = styled(motion.div)`
 display: grid;
 gap: 5px;
 grid-template-columns: repeat(6, 1fr);
 position: absolute;
 width: 100%;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
 background-color: white;
 background-image: url(${(props)=>props.bgPhoto});
 background-size:cover;
 background-position: center center;
 height: 200px;
 font-size: 50px;
 cursor: pointer;
  &:first-child{
    transform-origin: center left;
 }
 &:last-child{
    transform-origin: center right;
 }
`;

const boxVariants = {
    normal:{
        scale:1
    },
    hover:{
        scale:1.3,
        y: -50,
        transition: {
            delay: 0.3,
            duration: 0.3
        }
    }
}

const Banner = styled.div <{ bgPhoto: string }>`
 height: 100vh;
 background-color: orange;
 display: flex;
 flex-direction: column;
 justify-content: center;
 padding: 60px;
 background-image: linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url(${props => props.bgPhoto});
 background-size: cover;
`;

const Title = styled.h2`
 font-size: 68px;
`;

const Overview = styled.p`
 font-size: 34px;
 width: 50%;
`;

const Info = styled(motion.div)`
 padding: 10px;
 background-color: ${(props)=>props.theme.black.lighter};
 opacity: 0;
 position: absolute;
 width: 100%;
 bottom: 0;
 h4{
    text-align: center;
    font-size:18px;
 }
`;

const infoVariants ={
    hover:{
        opacity:1,
    }
}

const Overlay = styled(motion.div)`
 position: fixed;
 top: 0;
 width: 100%;
 height: 100%;
 background-color: rgba(0,0,0,0.6);
 opacity: 0;
`;

const MovieCard = styled(motion.div)`
 position: absolute;
 height: 40vh;
 width: 35vw;
 left: 0;
 right: 0;
 margin: 0 auto;
 border-radius: 15px;
 overflow: hidden;
 background-color: ${props => props.theme.black.lighter};
`;

const MovieCover = styled.img`
 width: 100%;
 height: 200px;
`;

const CardTitle = styled.h3`
 color: ${(props)=> props.theme.white.lighter};
 padding: 20px;
 font-size: 36px;
 position: relative;
 top: -80px;
`;

const CardOverView = styled.p`
 padding:20px;
 position: relative;
 top: -90px;
 color: ${(props)=> props.theme.white.lighter};
`;

const rowVariants = {
    hidden: {
        x: window.outerWidth+5,
    },
    visible: {
        x:0
    },
    exit: {
        x: -window.outerWidth-5,
    },
}


function Home() {
    const history = useHistory()
    const bigMovieMatch = useRouteMatch<{movieId:string}>("/movies/:movieId")
    const {scrollY} = useViewportScroll();
    const { data, isLoading } = useQuery<IGetMoviesResult>(["movies", "nowPlaying"], getMovies)
    const [index, setIndex] = useState(0);
    const [leaving, setLeaving] = useState(false);
    const offset=6;
    const increaseIndex = () => {
        if(data){
            if (leaving) return;
            toggleLeaving();
            const totalMovies = data.results.length-1;
            const maxIndex = Math.ceil(totalMovies / offset);
            setIndex((prev)=>(prev===maxIndex) ? 0 : prev+1);
        }
    };
    const onBoxClicked = (movieId:number) =>{
        history.push(`/movies/${movieId}`)
    };
    const toggleLeaving = () =>{
        setLeaving((prev)=>!prev);
    };
    const onOverlayClick = () =>{
        history.push(`/`)
    };
    const clickedMovie = bigMovieMatch?.params.movieId && data?.results.find((movie)=>movie.id===+bigMovieMatch.params.movieId)
    
    return <Wrapper>{isLoading ? (
        <Loader> Loading... </Loader>
    ) : (
        <>
            <Banner onClick={increaseIndex} bgPhoto={makeImagePath(data?.results[0].backdrop_path || "")}>
                <Title>{data?.results[0].title}</Title>
                <Overview>{data?.results[0].overview}</Overview>
            </Banner>
            <Slider>
                <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
                    <Row variants={rowVariants} initial="hidden" animate = "visible"
                         exit="exit" transition={{type:"tween", duration: 2}} key={index}>
                        {data?.results.slice(1).slice(offset * index,offset*index+offset)
                        .map((movie)=>(
                            <Box key={movie.id} whileHover="hover" initial="normal" transition={{type:"tween"}}
                            variants={boxVariants} onClick={()=>onBoxClicked(movie.id)}
                            bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                            layoutId={movie.id+""}
                            >
                            <Info variants={infoVariants}>
                                <h4>{movie.title}</h4>
                            </Info>
                            </Box>
                        ))}
                    </Row>
                </AnimatePresence>
            </Slider>
            <AnimatePresence>
            {bigMovieMatch ? (
                <>
                <Overlay onClick={onOverlayClick} animate={{opacity:1}} exit={{opacity:0}} />
                <MovieCard
                    layoutId={bigMovieMatch.params.movieId}
                    style={{
                        top: scrollY.get() + 120,
                    }}>{clickedMovie && (
                        <>
                            <MovieCover style={{
                        backgroundImage: `linear-gradient(to top, black, transparent), url(${makeImagePath(clickedMovie.backdrop_path, "w500")})`,}} />
                            <CardTitle>{clickedMovie.title}</CardTitle>
                            <CardOverView>
                                {clickedMovie.overview}
                            </CardOverView>
                        </>
                    )}
                    </MovieCard>
                </>
                ) : null}
            </AnimatePresence>
                
        </>
    )}</Wrapper>;

}
export default Home;
