import { Router } from "express";
import MovieController from "../controller/MovieController.js";

const router = Router();

/**
 * @openapi
 * /movies:
 *   get:
 *     tags:
 *       - Movies
 *     summary: Listar todos os filmes
 *     description: Retorna todos os filmes cadastrados, ordenados por título.
 *     responses:
 *       200:
 *         description: Lista de filmes retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *       500:
 *         description: Erro interno ao buscar filmes.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", MovieController.getAll);

/**
 * @openapi
 * /movies/search:
 *   get:
 *     tags:
 *       - Movies
 *     summary: Buscar filmes por palavra-chave
 *     description: Retorna os filmes cujo título, diretor ou sinopse contenham a palavra-chave.
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         description: Palavra-chave utilizada na pesquisa
 *         schema:
 *           type: string
 *           example: matrix
 *     responses:
 *       200:
 *         description: Filmes encontrados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Palavra-chave não informada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao pesquisar filmes.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/search", MovieController.search);

/**
 * @openapi
 * /movies/{id}:
 *   get:
 *     tags:
 *       - Movies
 *     summary: Buscar filme por ID
 *     description: Retorna um filme específico pelo seu identificador.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do filme.
 *     responses:
 *       200:
 *         description: Filme encontrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: Filme não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao buscar filme.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", MovieController.getById);

/**
 * @openapi
 * /movies:
 *   post:
 *     tags:
 *       - Movies
 *     summary: Criar um filme
 *     description: >
 *       Cadastra um novo filme. O gênero informado precisa existir e estar ativo.
 *       Título, ano, duração e diária são obrigatórios.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMovie'
 *     responses:
 *       201:
 *         description: Filme criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Dados inválidos ou gênero inexistente/inativo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao criar filme.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", MovieController.create);

/**
 * @openapi
 * /movies/{id}:
 *   put:
 *     tags:
 *       - Movies
 *     summary: Atualizar um filme
 *     description: Atualiza os dados de um filme existente. Apenas os campos informados são alterados.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do filme.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMovie'
 *     responses:
 *       200:
 *         description: Filme atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Dados inválidos ou gênero inexistente/inativo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Filme não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao atualizar filme.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", MovieController.update);

/**
 * @openapi
 * /movies/{id}:
 *   delete:
 *     tags:
 *       - Movies
 *     summary: Remover um filme
 *     description: Remove um filme pelo seu identificador. Não é possível remover um filme que possui locações.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do filme.
 *     responses:
 *       200:
 *         description: Filme removido com sucesso.
 *       400:
 *         description: Filme possui locações e não pode ser removido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Filme não encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao remover filme.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", MovieController.remove);

export default router;
