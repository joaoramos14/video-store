import { Router } from "express";
import RentalController from "../controller/RentalController.js";

const router = Router();

/**
 * @openapi
 * /rentals:
 *   get:
 *     tags:
 *       - Rentals
 *     summary: Listar todas as locações
 *     description: Retorna todas as locações cadastradas, da mais recente para a mais antiga.
 *     responses:
 *       200:
 *         description: Lista de locações retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rental'
 *       500:
 *         description: Erro interno ao buscar locações.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", RentalController.getAll);

/**
 * @openapi
 * /rentals/expire-reservations:
 *   post:
 *     tags:
 *       - Rentals
 *     summary: Expirar reservas vencidas
 *     description: >
 *       Marca como expired as reservas que não foram retiradas dentro do prazo
 *       e devolve as cópias ao estoque. Retorna quantas reservas foram expiradas.
 *     responses:
 *       200:
 *         description: Reservas vencidas expiradas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 2 reserva(s) expirada(s).
 *       500:
 *         description: Erro interno ao expirar reservas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/expire-reservations", RentalController.expireReservations);

/**
 * @openapi
 * /rentals/search:
 *   get:
 *     tags:
 *       - Rentals
 *     summary: Buscar locações por status
 *     description: >
 *       Retorna as locações com o status informado (reserved, active, late, returned,
 *       cancelled ou expired). O status late não é gravado: são as locações active
 *       com o prazo de devolução vencido.
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         description: Palavra-chave utilizada na pesquisa
 *         schema:
 *           type: string
 *           example: active
 *     responses:
 *       200:
 *         description: Locações encontradas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rental'
 *       400:
 *         description: Palavra-chave não informada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao pesquisar locações.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/search", RentalController.search);

/**
 * @openapi
 * /rentals/{id}:
 *   get:
 *     tags:
 *       - Rentals
 *     summary: Buscar locação por ID
 *     description: Retorna uma locação específica pelo seu identificador.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da locação.
 *     responses:
 *       200:
 *         description: Locação encontrada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rental'
 *       404:
 *         description: Locação não encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao buscar locação.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", RentalController.getById);

/**
 * @openapi
 * /rentals:
 *   post:
 *     tags:
 *       - Rentals
 *     summary: Reservar um filme
 *     description: >
 *       Cria uma locação com status reserved e separa uma cópia do estoque do filme.
 *       O cliente e o filme precisam existir, o cliente não pode ter outra reserva ou
 *       aluguel em andamento do mesmo filme e o filme precisa ter cópia no estoque.
 *       A diária é copiada do filme, o total é diária × dias (de 1 a 30) e a reserva
 *       vale por 24 horas. O prazo do aluguel só começa a contar na retirada.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRental'
 *     responses:
 *       201:
 *         description: Locação reservada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rental'
 *       400:
 *         description: Dados inválidos, cliente ou filme inexistente, filme sem estoque ou reserva/aluguel em andamento do mesmo filme.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao criar locação.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", RentalController.create);

/**
 * @openapi
 * /rentals/{id}:
 *   put:
 *     tags:
 *       - Rentals
 *     summary: Atualizar uma locação
 *     description: Altera a quantidade de dias de uma reserva que ainda não foi retirada e recalcula o total.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da locação.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRental'
 *     responses:
 *       200:
 *         description: Locação atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rental'
 *       400:
 *         description: Dias inválidos ou reserva que já foi retirada, cancelada ou expirada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Locação não encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao atualizar locação.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", RentalController.update);

/**
 * @openapi
 * /rentals/{id}:
 *   delete:
 *     tags:
 *       - Rentals
 *     summary: Remover uma locação
 *     description: Remove uma locação finalizada. Locações em aberto (reserved ou active) precisam ser canceladas ou devolvidas antes.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da locação.
 *     responses:
 *       200:
 *         description: Locação removida com sucesso.
 *       400:
 *         description: Locação em aberto não pode ser removida.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Locação não encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao remover locação.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", RentalController.remove);

/**
 * @openapi
 * /rentals/{id}/pickup:
 *   post:
 *     tags:
 *       - Rentals
 *     summary: Retirar o filme reservado
 *     description: >
 *       Muda a locação de reserved para active e define a data de devolução (retirada + dias).
 *       A retirada só é possível até 24 horas após a reserva; depois disso é recusada,
 *       e a reserva é marcada como expired pela rota de expiração de reservas.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da locação.
 *     responses:
 *       200:
 *         description: Filme retirado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rental'
 *       400:
 *         description: Reserva cancelada, expirada, já retirada ou fora do prazo de retirada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Locação não encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao retirar locação.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/pickup", RentalController.pickUp);

/**
 * @openapi
 * /rentals/{id}/return:
 *   post:
 *     tags:
 *       - Rentals
 *     summary: Devolver o filme
 *     description: >
 *       Muda a locação de active para returned e devolve a cópia ao estoque.
 *       Em caso de atraso, cobra multa de 1,5 × a diária por dia (ou fração) de atraso.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da locação.
 *     responses:
 *       200:
 *         description: Filme devolvido com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rental'
 *       400:
 *         description: Filme já devolvido, ainda não retirado ou aluguel encerrado sem retirada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Locação não encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao devolver locação.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/return", RentalController.returnMovie);

/**
 * @openapi
 * /rentals/{id}/cancel:
 *   post:
 *     tags:
 *       - Rentals
 *     summary: Cancelar a reserva
 *     description: Cancela uma reserva que ainda não foi retirada e devolve a cópia ao estoque.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da locação.
 *     responses:
 *       200:
 *         description: Reserva cancelada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rental'
 *       400:
 *         description: Reserva que já foi retirada, cancelada ou expirada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Locação não encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno ao cancelar locação.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/cancel", RentalController.cancel);

export default router;
