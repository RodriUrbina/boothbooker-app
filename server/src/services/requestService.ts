import { PrismaClient } from '@prisma/client';
import { Request, PublicRequest, EventRequest } from '../models/request';

const prisma = new PrismaClient();

export const createRequest = async (
  eventBoothId: number,
  applicantId: number,
  status: 'O' | 'A' | 'D'
): Promise<PublicRequest> => {
  const request = await prisma.request.create({
    data: { eventBoothId, applicantId, status },
    select: {
      id: true,
      eventBoothId: true,
      applicantId: true,
      status: true,
    },
  });
  return request as PublicRequest;
};

export const getAllRequests = async (): Promise<PublicRequest[]> => {
  const requests = await prisma.request.findMany({
    select: {
      id: true,
      eventBoothId: true,
      applicantId: true,
      status: true,
    },
  });
  return requests.map((request: any) => ({
    ...request,
    status: request.status as 'O' | 'A' | 'D',
  }));
};

export const getRequestById = async (
  id: number
): Promise<PublicRequest | null> => {
  const request = await prisma.request.findUnique({
    where: { id },
    select: {
      id: true,
      eventBoothId: true,
      applicantId: true,
      status: true,
    },
  });
  return request
    ? { ...request, status: request.status as 'O' | 'A' | 'D' }
    : null;
};

export const getRequestsByEventBoothId = async (
  eventBoothId: number
): Promise<PublicRequest[]> => {
  const requests = await prisma.request.findMany({
    where: { eventBoothId },
    select: {
      id: true,
      eventBoothId: true,
      applicantId: true,
      status: true,
    },
  });
  return requests.map((request: any) => ({
    ...request,
    status: request.status as 'O' | 'A' | 'D',
  }));
};

export const getRequestsByApplicantId = async (
  applicantId: number
): Promise<EventRequest[]> => {
  const requests = await prisma.request.findMany({
    where: { applicantId },
    include: {
      eventBooth: {
        include: {
          event: true,
        },
      },
    },
  });

  return requests.map((request: any) => ({
    id: request.id,
    eventBoothId: request.eventBoothId,
    applicantId: request.applicantId,
    status: request.status as 'O' | 'A' | 'D',
    event: {
      id: request.eventBooth.event.id,
      name: request.eventBooth.event.name,
      date: request.eventBooth.event.date,
      local: request.eventBooth.event.local,
      description: request.eventBooth.event.description,
    },
  }));
};

export const getRequestsForEventsCreatedByUser = async (
  userId: number
): Promise<EventRequest[]> => {
  const requests = await prisma.request.findMany({
    where: {
      eventBooth: {
        event: {
          creatorId: userId,
        },
      },
      status: 'O', // Only fetch open requests
    },
    include: {
      eventBooth: {
        include: {
          event: true,
        },
      },
    },
  });

  return requests.map((request: any) => ({
    id: request.id,
    eventBoothId: request.eventBoothId,
    applicantId: request.applicantId,
    status: request.status as 'O' | 'A' | 'D',
    event: {
      id: request.eventBooth.event.id,
      name: request.eventBooth.event.name,
      date: request.eventBooth.event.date,
      local: request.eventBooth.event.local,
      description: request.eventBooth.event.description,
    },
  }));
};

export const updateRequest = async (
  id: number,
  data: Partial<Request>
): Promise<PublicRequest | null> => {
  const request = await prisma.request.update({
    where: { id },
    data,
    select: {
      id: true,
      eventBoothId: true,
      applicantId: true,
      status: true,
    },
  });
  return request
    ? { ...request, status: request.status as 'O' | 'A' | 'D' }
    : null;
};

export const acceptRequestAndDeclineOthers = async (
  id: number
): Promise<PublicRequest | null> => {
  const request = await prisma.request.update({
    where: { id },
    data: { status: 'A' },
    select: {
      id: true,
      eventBoothId: true,
      applicantId: true,
      status: true,
    },
  });

  if (request) {
    await prisma.request.updateMany({
      where: {
        eventBoothId: request.eventBoothId,
        id: { not: id },
      },
      data: { status: 'D' },
    });
  }

  return request
    ? { ...request, status: request.status as 'O' | 'A' | 'D' }
    : null;
};

export const declineRequest = async (
  id: number
): Promise<PublicRequest | null> => {
  const request = await prisma.request.update({
    where: { id },
    data: { status: 'D' },
    select: {
      id: true,
      eventBoothId: true,
      applicantId: true,
      status: true,
    },
  });
  return request
    ? { ...request, status: request.status as 'O' | 'A' | 'D' }
    : null;
};

export const deleteRequest = async (
  id: number
): Promise<PublicRequest | null> => {
  const request = await prisma.request.delete({
    where: { id },
    select: {
      id: true,
      eventBoothId: true,
      applicantId: true,
      status: true,
    },
  });
  return request
    ? { ...request, status: request.status as 'O' | 'A' | 'D' }
    : null;
};
