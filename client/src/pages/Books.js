import React, { Component } from "react";
import DeleteBtn from "../components/DeleteBtn";
import Jumbotron from "../components/Jumbotron";
import API from "../utils/API";
import { Link } from "react-router-dom";
import { Col, Row, Container } from "../components/Grid";
import { List, ListItem } from "../components/List";
import { Input, TextArea, FormBtn } from "../components/Form";
import Axios from "axios";
import SaveBtn from "../components/SaveBtn";

class Books extends Component {
  state = {
    books: [],
    title: "",
    authors: "",
    description: "",
    search: [],
    favorites: []
  };

  componentDidMount() {
    this.loadBooks();
    // Populate the favorites list
    Axios.get('/api/books')
      .then(response => {
        console.log('Data recieved from mongo', response.data);
        this.setState({
          favorites: response.data
        })
      }).catch(err => {
        console.error(err);
      });
  }

  loadBooks = () => {
    API.getBooks()
      .then(res =>
        this.setState({ books: res.data, title: "", authors: "", description: "" })
      )
      .catch(err => console.log(err));
  };

  saveTheBook(book) {
    console.log(book)
    this.setState({ books: book })
    console.log(this.state.books)
    API.saveBook({
      id: this.state.favorites.id,
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors,
      description: this.state.favorites.description,
      previewLink: book.volumeInfo.previewLink,

    })
      .then(res => this.loadBooks())
      .catch(err => console.log(err));
  }

  deleteBook = id => {
    API.deleteBook(id)
      .then(res => this.loadBooks())
      .catch(err => console.log(err));
  };

  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  };

  handleSearchFormSubmit = event => {
    event.preventDefault();
    if (this.state.title || this.state.author) {
      Axios.get("https://www.googleapis.com/books/v1/volumes?q=" + this.state.title + "+inauthor:" + this.state.author)
        .then(data => this.setState({ search: data.data.items }))
        .catch(function (error) { console.log(error) })
    }
  };

  render() {
    return (
      <Container fluid>
        <Row>
          <Col size="md-6">
            <Jumbotron>
              <h1>What Books Should I Read?</h1>
            </Jumbotron>
            <form>
              <Input
                value={this.state.title}
                onChange={this.handleInputChange}
                name="title"
                placeholder="Search By Title"
              />
              <Input
                value={this.state.author}
                onChange={this.handleInputChange}
                name="author"
                placeholder="Search By Author"
              />
              <FormBtn
                disabled={!(this.state.author || this.state.title)}
                onClick={this.handleSearchFormSubmit}
              >
                Search For Book
              </FormBtn>
            </form>
          </Col>
          <Col size="md-6 sm-12">
            <Jumbotron>
              <h1>Books On My List</h1>
            </Jumbotron>
            {this.state.books.length ? (
              <List>
                {this.state.books.map(book => (
                  <ListItem key={book._id}>
                    <Link to={"/books/" + book._id}>
                      <strong>
                        {book.title} by {book.authors}
                      </strong>
                    </Link>
                    <DeleteBtn onClick={() => this.deleteBook(book._id)} />
                  </ListItem>
                ))}
              </List>
            ) : (
                <h3>No Results to Display</h3>
              )}
          </Col>
        </Row>
        <Row>
          <Col size="md-6 sm-12">
            <Jumbotron>
              <h1>Search Results</h1>
            </Jumbotron>
            {this.state.search.length ? (
              <List>
                {this.state.search.map(book => (
                  <ListItem key={book._id} id={book.id} title={book.volumeInfo.title} authors={book.volumeInfo.authors} description={book.volumeInfo.descriiption} > {/*image={book.volumeInfo.imageLinks.thumbnail}*/}
                    <Link to={"/books/" + book._id}>
                      <strong>
                        <p>Title: {book.volumeInfo.title}</p>
                        <p>Authors: {book.volumeInfo.authors}</p>
                        <p>Description: {book.volumeInfo.description}</p>
                        <p>Preview: {book.volumeInfo.previewLink}</p>
                        {/* <img src={book.volumeInfo.imageLinks.thumbnail} /> */}
                      </strong>
                    </Link>
                    <SaveBtn onClick={() => this.saveTheBook(book)} />
                  </ListItem>
                ))}
              </List>
            ) : (
                <h3>No Results to Display</h3>
              )}
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Books;
