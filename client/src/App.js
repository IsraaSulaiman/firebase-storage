import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
class App extends Component {
  state = {
    image: '',
    images: [],
  }

  async componentDidMount() {
    //get images
    const getResponse = await axios.get('/api/v1/image');
    const editedReponse = getResponse.data.map(url => {
      const splitUrl = url.id.split('/');
      url.id = splitUrl[splitUrl.length - 1];
      return url;
    })
    this.setState({ images: editedReponse });

  }

  handleChange = (e) => {
    //validate Size//
    // const imageSize = e.target.files[0].size;
    this.setState({ image: e.target.files[0] })
  }

  handleUploadFile = async (e) => {
    e.preventDefault();
    // post image
    try {
      const imageName = this.state.image;

      // Create a form to append file
      
      const form = new FormData();
      form.append('file', imageName);
      const postResponse = await axios
        .post('/api/v1/image', form);

      const signedUrl = postResponse.data.imageUrl;

      this.setState((preveState) => {
        return { images: [...preveState.images, { id: imageName.name, imageUrl: signedUrl }] }
      });
    } catch (error) {
      console.log(error);
    }
  }

  deleteImage = async (e) => {
    const imageName = e.target.id;
    //delete
    await axios.delete('/api/v1/image', { data: { imageName } });

    this.setState((preveState) => {
      const filteredImages = preveState.images.filter((image) => {
        return image.id !== imageName
      });
      return { images: filteredImages }
    })
  }

  downloadImage = async (e) => {
    const imageName = e.target.id;
    const downloadReponse = await axios.post('api/v1/download', { imageName });
    console.log(downloadReponse);
    //still not done//
  }
  render() {
    return (
      <div className="App" >
        <form>
          <input onChange={this.handleChange} type='file' />
          <button onClick={this.handleUploadFile}>Upload</button>
        </form>
        <div className='container'>
          {this.state.images && this.state.images.map((image, index) => {
            return (<div key={image.id}><img id={image.id} onClick={this.downloadImage} src={image.imageUrl} alt={image.id} /><button id={image.id} onClick={this.deleteImage}>Delete</button></div>)
          })}
        </div>
      </div >
    );
  }
}

export default App;
