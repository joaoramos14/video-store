import { Router } from "express";
import CustomerController from "../controller/CustomerController.js";

const router = Router();

/**
 * @openapi
 * /customers:
 *   get:
 *     tags:
 *       - Customers
 *     summary: Listar todos os clientes
 *     description: Retorna todos os clientes cadastrados, ordenados por nome.
 *     responses:
 *       200:
 *         description: Lista de clientes retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       500:
 *         description: Erro interno ao buscar clientes.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", CustomerController.getAll);

/**
 * @openapi
 * /customers/search:
 *   get:
 *     tags:
 *       - Customers
 *     summary: Buscar clientes por palavra-chave
 *     description: Retorna os clientes cujo nome, e-mail ou CPF contenham a palavra-chave.
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         description: Palavra-chave utilizada na pesquisa
 *         schema:
 *           type: string
 *           example: maria
 *     responses:
 *       200:
 *         description: Clientes encontrados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Palavra-chave não informada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao pesquisar clientes.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/search", CustomerController.search);

/**
 * @openapi
 * /customers/{id}:
 *   get:
 *     tags:
 *       - Customers
 *     summary: Buscar cliente por ID
 *     description: Retorna um cliente específico pelo seu identificador.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente.
 *     responses:
 *       200:
 *         description: Cliente encontrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Cliente não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao buscar cliente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", CustomerController.getById);

/**
 * @openapi
 * /customers/{id}/rentals:
 *   get:
 *     tags:
 *       - Customers
 *     summary: Listar as locações de um cliente
 *     description: Retorna as locações do cliente informado, da mais recente para a mais antiga.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente.
 *     responses:
 *       200:
 *         description: Locações do cliente retornadas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rental'
 *       404:
 *         description: Cliente não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao buscar locações do cliente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id/rentals", CustomerController.getRentals);

/**
 * @openapi
 * /customers:
 *   post:
 *     tags:
 *       - Customers
 *     summary: Criar um cliente
 *     description: Cadastra um novo cliente. Nome, e-mail e CPF são obrigatórios; o e-mail e o CPF não podem se repetir.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCustomer'
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Dados inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao criar cliente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", CustomerController.create);

/**
 * @openapi
 * /customers/{id}:
 *   put:
 *     tags:
 *       - Customers
 *     summary: Atualizar um cliente
 *     description: Atualiza os dados de um cliente existente. Apenas os campos informados são alterados.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCustomer'
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Dados inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cliente não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao atualizar cliente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", CustomerController.update);

/**
 * @openapi
 * /customers/{id}:
 *   delete:
 *     tags:
 *       - Customers
 *     summary: Remover um cliente
 *     description: Remove um cliente pelo seu identificador. Não é possível remover um cliente que possui locações.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente.
 *     responses:
 *       200:
 *         description: Cliente removido com sucesso.
 *       400:
 *         description: Cliente possui locações e não pode ser removido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cliente não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao remover cliente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", CustomerController.remove);

export default router;
