import React, { Component } from "react";
import { API_URL, API_KEY } from "../../config";
import Navigation from "../elements/Navigation/Navigation";
import MovieInfo from "../elements/MovieInfo/MovieInfo";
import MovieInfoBar from "../elements/MovieInfoBar/MovieInfoBar";
import FourColGrid from "../elements/FourColGrid/FourColGrid";
import Actor from "../elements/Actor/Actor";
import Spinner from "../elements/Spinner/Spinner";
import "./Movie.css";
class Movie extends Component {
  constructor(props) {
    super(props);

    this.state = {
      movie: null,
      actors: null,
      directors: [],
      loading: false,
    };
  }
  componentDidMount() {
    if (localStorage.getItem(`${this.props.match.params.movieId}`)) {
      const state = JSON.parse(
        localStorage.getItem(`${this.props.match.params.movieId}`)
      );
      this.setState({ ...state });
    } else {
      this.setState({
        loading: true,
      });
      // First fetch the movie ...
      const endPoint = `${API_URL}movie/${this.props.match.params.movieId}?api_key=${API_KEY}&language=en-US`;
      this.fetchItems(endPoint);
    }
  }

  fetchItems = (endpoint) => {
    fetch(endpoint)
      .then((result) => result.json())
      .then((result) => {
        console.log(result);
        if (result.status_code) {
          this.setState({ loading: false });
        } else {
          this.setState({ movie: result }, () => {
            // ... then fetch actors in the setState callback function
            const endpoint = `${API_URL}movie/${this.props.match.params.movieId}/credits?api_key=${API_KEY}`;
            fetch(endpoint)
              .then((result) => result.json())
              .then(
                (result) => {
                  const directors = result.crew.filter(
                    (member) => member.job === "Director"
                  );

                  this.setState({
                    actors: result.cast,
                    directors,
                    loading: false,
                  });
                },
                () => {
                  localStorage.setItem(
                    `${this.props.match.params.movieId}`,
                    JSON.stringify(this.state)
                  );
                }
              );
          });
        }
      })
      .catch((error) => console.error("Error:", error));
  };
  render() {
    const { movie, directors, actors, loading } = this.state;
    const { location } = this.props;
    return (
      <div className="rmdb-movie">
        {movie ? (
          <div>
            <Navigation movie={location.movieName}></Navigation>
            <MovieInfo movie={movie} directors={directors}></MovieInfo>
            <MovieInfoBar
              time={movie.runtime}
              budget={movie.budget}
              revenue={movie.revenue}
            ></MovieInfoBar>
          </div>
        ) : null}

        {actors ? (
          <div className="rmdb-movie-grid">
            <FourColGrid header={"Actors"}>
              {actors.map((element, i) => {
                return <Actor key={i} actor={element}></Actor>;
              })}
            </FourColGrid>
          </div>
        ) : null}
        {!actors && !loading ? <h1>No Movie Found!</h1> : null}
        {loading ? <Spinner></Spinner> : null}
      </div>
    );
  }
}

export default Movie;
