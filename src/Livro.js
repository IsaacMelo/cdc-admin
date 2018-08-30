import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from  './TratadorErros';

export class FormularioLivros extends Component{
    constructor() {
        super();
        this.state = {titulo:'',preco:'',autorId:''};
        this.enviaForm = this.enviaForm.bind(this);
        this.setTitulo = this.setTitulo.bind(this);
        this.setPreco = this.setPreco.bind(this);
        this.setAutorId = this.setAutorId.bind(this);
    }

    setTitulo(evento){
        this.setState({titulo:evento.target.value});
    }

    setPreco(evento){
        this.setState({preco:evento.target.value});
    }

    setAutorId(evento){
        this.setState({autorId:evento.target.value});
    }

    enviaForm(evento){
        evento.preventDefault();
        $.ajax({
            url:'http://localhost:8080/api/livros',
            contentType:'application/json',
            dataType:'json',
            type:'post',
            data: JSON.stringify({titulo:this.state.titulo,preco:this.state.preco,autorId:this.state.autorId}),
          success: function(novaListagem){
            PubSub.publish('atualiza-lista-livros',novaListagem);
            this.setState({titulo:'',preco:'',autorId:''});
          }.bind(this),
          error: function(resposta){
            if(resposta.status === 400){
                new TratadorErros().publicaErros(resposta.responseJSON);
            }
          },
          beforeSend: function(){
            PubSub.publish("limpa-erros",{});
          }
        });
    }

    render(){
        return (              
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm.bind(this)} method="POST">
                <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.setTitulo} label="Titulo"/>
                <InputCustomizado id="preco" type="text" name="preco" value={this.state.preco} onChange={this.setPreco} label="Preço"/>
                <div className="pure-controls">
                    <select name="autorId" onChange={this.setAutorId}>
                        <option value="">Selecione autor</option>
                        {
                            this.props.autores.map(function(autor){
                                return <option  key={ autor.id } value={autor.id}>{autor.nome}</option>
                            })
                        }
                    </select>
                </div>

                <div className="pure-control-group">                                  
                    <label></label> 
                    <button type="submit" className="pure-button pure-button-primary">Gravar</button>                                    
                </div>
                </form>             
            </div> 
        )
    }
}

export class TabelaLivros extends Component {
    render(){
        return(
          <div>            
            <table className="pure-table">
              <thead>
                <tr>
                    <th>Título</th>
                    <th>Preço</th>
                    <th>Autor</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.props.lista.map(function(livro){
                    return (
                      <tr key={livro.id}> 
                        <td>{livro.titulo}</td>
                        <td>{livro.preco}</td>
                        <td>{livro.autor.nome}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table> 
          </div>
        )
    }
}

export default class LivroBox extends Component{
    constructor() {
        super();
        this.state = {lista : [],autores : []};
    }

    componentDidMount(){
        $.ajax({
          url: "http://localhost:8080/api/livros",
          dateType: 'json',
          success:function(date){
            this.setState({lista:date});
          }.bind(this)
        });

        $.ajax({
            url: "http://localhost:8080/api/autores",
            dateType: 'json',
            success:function(date){
              this.setState({autores:date});
            }.bind(this)
        });

        PubSub.subscribe('atualiza-lista-livros', function(topico,novaLista){
            this.setState({lista:novaLista});
        }.bind(this));
    }

    render(){
        return(
            <div>
                <div className="header">
                    <h1>Cadastro de Livros</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivros autores={this.state.autores}/>                       
                    <TabelaLivros  lista={this.state.lista} />
                </div>      
            </div>
        );
    }
}