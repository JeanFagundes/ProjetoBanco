const inquirer = require('inquirer')
const chalk = require('chalk')
const fs = require('fs');
const { json } = require('express/lib/response');
const { stringify } = require('querystring');

menu()

function menu() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Selecione a opção desejada',
                choices: [
                    'Criar uma conta',
                    'Depositar dinheiro',
                    'Sacar dinheiro',
                    'Consultar saldo',
                    'Sair'
                ]
            }

        ]).then(answers => {

            if (answers.action == 'Criar uma conta') {

                console.log(chalk.bgBlue.green.bold('Obrigado por escolher nosso banco!'))
                console.log(chalk.green.bold('Digite os dados a seguir para prosseguirmos com a criação \n'))
                criarConta();

            } else if (answers.action == 'Depositar dinheiro') {
                depositarDinheiro()

            } else if (answers.action == 'Sacar dinheiro') {
                sacarDinheiro()

            } else if (answers.action == 'Consultar saldo') {
                consultarSaldo()

            } else if (answers.action == 'Sair') {
                console.log(chalk.bgBlue('Obrigado por usar nosso banco.\n'))
                process.exit()
            }

        }).catch((err) => console.log(err))
}

function criarConta() {

    inquirer.prompt([
        {
            type: 'input',
            name: 'nomeDaConta',
            message: 'Digite o nome da conta que vai ser criada'
        }
    ]).then((answers) => {

        if (checarConta(answers.nomeDaConta)) {
            console.log(chalk.bgRed.black('Esta conta ja existe, escolha outro nome! \n'))
            return criarConta()
        }

        fs.writeFileSync(`contas/${answers.nomeDaConta}.json`,
            '{"balance":0}',
            function (err) { console.log(err) })

        console.log(chalk.green('Parabéns, a sua conta foi criada. \n'))

        return menu()

    }).catch((err) => console.log(err))
}

function checarConta(nome) {

    if (!fs.existsSync('contas')) {
        fs.mkdirSync('contas')
    }

    if (fs.existsSync(`contas/${nome}.json`)) {
        return true
    }
    return false
}

function depositarDinheiro() {

    inquirer
        .prompt([

            {
                type: 'input',
                name: 'nomeDaConta',
                message: 'Informe o nome da sua conta.',

            },
            {
                type: 'input',
                name: 'valor',
                message: 'Informe o valor que deseja depositar em sua conta.'
            }

        ]).then((answers => {
            const nome = answers['nomeDaConta']
            const valor = answers['valor']

            if (checarConta(nome)) {
                adicionarValor(nome, valor)
                return menu()
            } else {
                console.log(chalk.bgRed('Não existe essa conta \n'))
                return depositarDinheiro()
            }
        })).catch((err) => console.log(err))

}

function localizarConta(nome) {

    var saldo = fs.readFileSync(`contas/${nome}.json`, {
        encoding: 'utf8',
        flag: 'r',
    })

    return JSON.parse(saldo)
}

function adicionarValor(nome, valor) {

    const usuario = localizarConta(nome)

    usuario.balance = parseFloat(valor) + parseFloat(usuario.balance)

    fs.writeFileSync(`contas/${nome}.json`,
        JSON.stringify(usuario),
        function (err) { console.log(err) })

    console.log(chalk.green(`\nFoi adicionado R$${valor} em sua conta`))
    console.log(chalk.bgBlue(`Saldo total: R$${usuario.balance}\n`))
}

function consultarSaldo() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'conta',
            message: 'Informe sua conta para consultar o seu saldo'
        }
    ]).then((answers => {

        if (checarConta(answers.conta)) {
            Saldo(answers.conta)
            return menu()

        } else {
            console.log(chalk.bgRed.black('Essa conta não existe em nosso banco de dados.\n'))
            return consultarSaldo()
        }
    })).catch((err => console.log(err)))

}

function Saldo(conta) {
    var conta = stringify(((localizarConta(conta))))
    var obj = conta.split("=")
    console.log(chalk.green(`O seu saldo é de R$${obj[1]}\n`))
}

function sacarDinheiro() {

    inquirer
        .prompt([
            {
                type: 'input',
                name: 'nome',
                message: 'Informe sua conta para prosseguir com o saque',
            }
        ]).then((answers => {
            var nomedaConta = answers['nome']

            if (checarConta(nomedaConta)) {

            } else {
                console.log(chalk.bgRed('Essa conta não existe em nosso banco de dados.\n'))
                return sacarDinheiro()
            }

            inquirer
                .prompt([
                    {
                        type: 'input',
                        name: 'sacar',
                        message: 'Informe o valor do saque'
                    }
                ]).then(answers => {

                    retirarValor(nomedaConta, answers.sacar)

                    // console.log(Saldo(nomedaConta))

                })
        })).catch((err => console.log(err)))
}

function retirarValor(nome, valor) {
    
    const usuario = localizarConta(nome)

    const saldo = parseFloat(usuario.balance)

    usuario.balance = parseFloat(usuario.balance) - parseFloat(valor)
    if (usuario.balance >= 0 && valor>10) {
        fs.writeFileSync(`contas/${nome}.json`,
            JSON.stringify(usuario),
            function (err) { console.log(err) })

        console.log(chalk.green(`Voce sacou R$${valor} de sua conta`))
        console.log(chalk.bgBlue(`Saldo total: R$${usuario.balance}\n`))
        return menu()
    } else {
        //  var saldo = Saldo(nome)

        if (saldo <= 10 || valor <=10) {
            console.log(chalk.bgRed('O valor minimo para saque é de R$10.00 \n'))
            return menu()
        }
        console.log(chalk.bgRed(`Voce não possui esse valor em conta, seu saldo é de R$${saldo}\n`))

        return sacarDinheiro()
    }
}
