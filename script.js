// document.getElementById("tarefaInput").focus();
const listaTarefas = document.getElementById("listaTarefas");
const tarefaInput = document.getElementById("tarefaInput");
const botaoAdicionar = document.getElementById("btn-adicionar");

tarefaInput.focus(); //pra ir pro input

let itemArrastado = null;
//array que vai guardar todas as tarefas e sincronizar com locaStorage
let tarefas = [];

const tarefasSalvas = localStorage.getItem("tarefas");
if (tarefasSalvas) {
  tarefas = JSON.parse(tarefasSalvas);

  tarefas.forEach((tarefa) => {
    adicionaTarefaComTexto(tarefa.texto, tarefa.concluida);
  });
}

listaTarefas.addEventListener("dragover", (e) => e.preventDefault()); //é necessário para que o elemento se torne um alvo válido de drop. Sem ele, o navegador não permitirá que você solte o item.

listaTarefas.addEventListener("drop", (e) => {
  e.preventDefault();
  const itemAtual = e.target.closest("li");
  //Só faz a troca se o item sobre o qual você soltou existir e não for o mesmo que está sendo arrastado.
  if (itemAtual && itemAtual !== itemArrastado) {
    const referencia =
      itemArrastado.compareDocumentPosition(itemAtual) &
      Node.DOCUMENT_POSITION_FOLLOWING
        ? itemAtual.nextSibling
        : itemAtual;

    //Move o item arrastado para a posição correta dentro da lista, trocando visualmente com o outro item.
    listaTarefas.insertBefore(itemArrastado, referencia);

    salvarTerefas();
  }
});

//Evento: dragend ocorre quando você termina de arrastar um item, independente de ter soltado sobre algo ou não.
listaTarefas.addEventListener("dragend", (e) => {
  if (e.target.tagName === "LI") {
    e.target.style.opacity = "1";
  }
});

function salvarTerefas() {
  tarefas = [];
  listaTarefas.querySelectorAll("li").forEach((li) => {
    tarefas.push({
      texto: li.querySelector("span").textContent,
      concluida: li.classList.contains("tarefa__concluida"),
    });
  });
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

function adicionaTarefa() {
  let valorinput = tarefaInput.value.trim();
  //aqui ja estou transformando todas as tarefas em letra maiuscula
  valorinput = valorinput.toUpperCase();
  const regex = /[^a-zA-Z0-9 ]/;

  if (valorinput === "" || !isNaN(valorinput) || regex.test(valorinput)) {
    alert("Digite uma tarefa!");
    return;
  }
  adicionaTarefaComTexto(valorinput, false);
  tarefaInput.focus();
}

tarefaInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    botaoAdicionar.click();
  }
});

// é aqui que cria cada li
function adicionaTarefaComTexto(texto, concluida = false) {
  const novaTarefa = document.createElement("li"); //cria a nova li
  novaTarefa.setAttribute("draggable", "true");

  novaTarefa.addEventListener("dragstart", (e) => {
    itemArrastado = e.target; // marca o item que está sendo arrastado
    e.target.style.opacity = "0.5"; // efeito visual
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
  });

  //span para o texto
  const spanTexto = document.createElement("span");
  spanTexto.textContent = texto;
  novaTarefa.appendChild(spanTexto);

  if (concluida) {
    novaTarefa.classList.add("tarefa__concluida");
  }

  //botão deletar
  const botaoDeletar = document.createElement("button");
  botaoDeletar.textContent = "Deletar tarefa";
  botaoDeletar.classList.add("btn-deletar");

  botaoDeletar.onclick = () => {
    listaTarefas.removeChild(novaTarefa);
    salvarTerefas();
  };

  //botão concluido
  const botaoConcluido = document.createElement("button");
  botaoConcluido.textContent = "Marcar concluida";
  botaoConcluido.classList.add("btn-pendente");
  botaoConcluido.classList.add("btn-concluido");

  botaoConcluido.onclick = () => {
    novaTarefa.classList.toggle("tarefa__concluida");

    //resolvi adicionar uma mudança no botao de tarefa concluida
    if (novaTarefa.classList.contains("tarefa__concluida")) {
      botaoConcluido.textContent = "Marcar pendente";
    } else {
      botaoConcluido.textContent = "Marcar concluída";
    }

    salvarTerefas();
  };

  //botão editar
  const botaoEditar = document.createElement("button");
  botaoEditar.textContent = "Editar tarefa";
  botaoEditar.classList.add("btn-editar");

  botaoEditar.onclick = () => {
    const inputAtual = novaTarefa.querySelector("input"); // pega o input se existir
    const spanAtual = novaTarefa.querySelector("span"); // pega o span que está no DOM agora

    if (spanAtual) {
      // entra no modo edição
      const inputEdicao = document.createElement("input");
      inputEdicao.type = "text";
      inputEdicao.value = spanAtual.textContent;

      novaTarefa.replaceChild(inputEdicao, spanAtual); // substitui span pelo input
      botaoEditar.textContent = "Salvar";
    } else if (inputAtual) {
      // valida e salva a edição
      if (inputAtual.value.trim() === "" || !isNaN(inputAtual.value)) {
        alert("Digite uma tarefa!");
        return;
      }
      // salva a edição
      const novoSpan = document.createElement("span");
      //a nova tarefa editada tambem vai ficar e letra maiuscula
      novoSpan.textContent = inputAtual.value.toUpperCase();
      inputAtual.replaceWith(novoSpan); // substitui input pelo novo span
      botaoEditar.textContent = "Editar tarefa";
      salvarTerefas();
    }
  };

  const divListas = document.createElement("div");
  divListas.classList.add("container__listas");

  const divBotoes = document.createElement("div");
  divBotoes.classList.add("container__botoes");

  divBotoes.appendChild(botaoDeletar);
  divBotoes.appendChild(botaoConcluido);
  divBotoes.appendChild(botaoEditar);

  divListas.appendChild(divBotoes);

  novaTarefa.appendChild(spanTexto);
  novaTarefa.appendChild(divListas);

  //coloca li na lista
  listaTarefas.appendChild(novaTarefa);

  tarefaInput.value = "";

  //atualiza o localstorage
  salvarTerefas();
}
